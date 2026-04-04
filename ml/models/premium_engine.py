"""
Premium Engine — XGBoost-based weekly premium calculator

Inputs:
  - zone_pincode       (str → encoded)
  - season             (str → one-hot: summer / monsoon / winter / spring)
  - worker_tenure_months (int)
  - disruption_history_count (int)
  - platform           (str → binary: zomato=0, swiggy=1)

Output:
  - weekly_premium: ₹39 – ₹72

Base premium: ₹49
Adjustments:
  - Monsoon season: +₹8
  - Summer season: +₹3
  - High disruption history (>5): +₹6
  - Low tenure (<3 months): +₹5
  - Veteran (>24 months): -₹7
  - Low-risk zone: -₹4
"""

import numpy as np

try:
    import xgboost as xgb
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

# ── Constants ─────────────────────────────────────────────
BASE_PREMIUM = 49
MIN_PREMIUM = 39
MAX_PREMIUM = 72

# Zones classified by flood / disruption risk
HIGH_RISK_PINCODES = {
    "560034",  # Koramangala
    "400069",  # Andheri
    "110001",  # Connaught Place
}

LOW_RISK_PINCODES = {
    "560038",  # Indiranagar
    "400050",  # Bandra
    "110016",  # Hauz Khas
}

SEASON_MAP = {
    "summer": 0,
    "monsoon": 1,
    "winter": 2,
    "spring": 3,
}

PLATFORM_MAP = {
    "zomato": 0,
    "swiggy": 1,
}


def _rule_based_premium(
    zone_pincode: str,
    season: str,
    worker_tenure_months: int,
    disruption_history_count: int,
    platform: str,
) -> float:
    """
    Deterministic rule-based fallback (used when XGBoost is not trained yet).
    Mirrors the adjustment table from the README.
    """
    premium = float(BASE_PREMIUM)

    # Season adjustments
    if season == "monsoon":
        premium += 8
    elif season == "summer":
        premium += 3

    # Disruption history
    if disruption_history_count > 5:
        premium += 6
    elif disruption_history_count > 2:
        premium += 3

    # Tenure
    if worker_tenure_months < 3:
        premium += 5
    elif worker_tenure_months > 24:
        premium -= 7

    # Zone risk
    if zone_pincode in LOW_RISK_PINCODES:
        premium -= 4
    elif zone_pincode in HIGH_RISK_PINCODES:
        premium += 4

    # Clamp
    return float(np.clip(premium, MIN_PREMIUM, MAX_PREMIUM))


def _prepare_features(
    zone_pincode: str,
    season: str,
    worker_tenure_months: int,
    disruption_history_count: int,
    platform: str,
) -> np.ndarray:
    """
    Encode inputs into a feature vector for the XGBoost model.
    Feature order: [pincode_hash, season_enc, tenure, disruptions, platform_enc]
    """
    pincode_hash = hash(zone_pincode) % 10000  # simple numeric encoding
    season_enc = SEASON_MAP.get(season, 0)
    platform_enc = PLATFORM_MAP.get(platform, 0)

    return np.array([[
        pincode_hash,
        season_enc,
        worker_tenure_months,
        disruption_history_count,
        platform_enc,
    ]], dtype=np.float32)


# ── Synthetic training data generator ─────────────────────

def _generate_training_data(n_samples: int = 2000) -> tuple:
    """
    Generate synthetic training data using the rule-based engine
    so the XGBoost model learns the same pricing logic (with slight noise).
    """
    rng = np.random.default_rng(42)

    pincodes = list(HIGH_RISK_PINCODES | LOW_RISK_PINCODES) + ["500001", "600001"]
    seasons = list(SEASON_MAP.keys())
    platforms = list(PLATFORM_MAP.keys())

    X_list, y_list = [], []
    for _ in range(n_samples):
        pc = rng.choice(pincodes)
        sn = rng.choice(seasons)
        tenure = int(rng.integers(1, 60))
        disruptions = int(rng.integers(0, 15))
        plat = rng.choice(platforms)

        features = _prepare_features(pc, sn, tenure, disruptions, plat)
        label = _rule_based_premium(pc, sn, tenure, disruptions, plat)
        # Add ±₹1 noise for realism
        label += rng.normal(0, 1)
        label = float(np.clip(label, MIN_PREMIUM, MAX_PREMIUM))

        X_list.append(features[0])
        y_list.append(label)

    return np.array(X_list), np.array(y_list)


# ── Model management ─────────────────────────────────────

_model = None


def train_model() -> None:
    """Train the XGBoost model on synthetic data."""
    global _model
    if not HAS_XGB:
        print("[PremiumEngine] xgboost not installed — using rule-based fallback")
        return

    X, y = _generate_training_data()
    dtrain = xgb.DMatrix(X, label=y)

    params = {
        "objective": "reg:squarederror",
        "max_depth": 4,
        "eta": 0.1,
        "subsample": 0.8,
        "colsample_bytree": 0.8,
        "seed": 42,
    }
    _model = xgb.train(params, dtrain, num_boost_round=200)
    print("[PremiumEngine] XGBoost model trained on 2000 synthetic samples")


def calculate_premium(
    zone_pincode: str,
    season: str,
    worker_tenure_months: int,
    disruption_history_count: int,
    platform: str,
) -> dict:
    """
    Calculate weekly premium for a worker.

    Returns:
        dict with keys: weekly_premium, model_used, breakdown
    """
    # Try XGBoost first
    if HAS_XGB and _model is not None:
        features = _prepare_features(
            zone_pincode, season, worker_tenure_months,
            disruption_history_count, platform,
        )
        dmat = xgb.DMatrix(features)
        raw = float(_model.predict(dmat)[0])
        premium = float(np.clip(round(raw), MIN_PREMIUM, MAX_PREMIUM))
        model_used = "xgboost"
    else:
        premium = _rule_based_premium(
            zone_pincode, season, worker_tenure_months,
            disruption_history_count, platform,
        )
        premium = round(premium)
        model_used = "rule_based"

    return {
        "weekly_premium": premium,
        "currency": "INR",
        "model_used": model_used,
        "inputs": {
            "zone_pincode": zone_pincode,
            "season": season,
            "worker_tenure_months": worker_tenure_months,
            "disruption_history_count": disruption_history_count,
            "platform": platform,
        },
        "bounds": {"min": MIN_PREMIUM, "max": MAX_PREMIUM},
    }
