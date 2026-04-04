/**
 * Payout Service
 *
 * - Creates a Razorpay payout (test mode) to the worker's UPI ID
 * - Logs the payout to the Supabase `payouts` table
 * - Emits a Supabase Realtime event after success
 */

const Razorpay = require('razorpay');
const { createClient } = require('@supabase/supabase-js');

// ── Clients ──────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

// ── Core ─────────────────────────────────────────────────

/**
 * Trigger a payout.
 *
 * @param {Object} opts
 * @param {string} opts.workerId
 * @param {string} opts.policyId
 * @param {string} opts.upiId       – e.g. "worker@upi"
 * @param {number} opts.amount      – amount in ₹ (integer)
 * @param {string} opts.reason      – "weather_disruption" | "platform_outage"
 * @param {Object} opts.meta        – arbitrary diagnostics payload
 * @returns {Object} payout record
 */
async function trigger({ workerId, policyId, upiId, amount, reason, meta = {} }) {
  console.log(`[PayoutService] triggering ₹${amount} → ${upiId}  reason=${reason}`);

  // ── 1. Create a claim ───────────────────────────────────
  const { data: claim, error: claimErr } = await supabase
    .from('claims')
    .insert({
      policy_id: policyId,
      status: 'auto_approved',
      trigger_reason: reason,
      meta,
    })
    .select()
    .single();

  if (claimErr) {
    console.error('[PayoutService] claim insert error:', claimErr.message);
    throw new Error(`Claim creation failed: ${claimErr.message}`);
  }

  // ── 2. Razorpay payout (test mode) ─────────────────────
  let razorpayPayout = null;
  try {
    razorpayPayout = await razorpay.payouts.create({
      account_number: process.env.RAZORPAY_ACCOUNT_NUMBER || 'TEST_ACCOUNT',
      fund_account: {
        account_type: 'vpa',
        vpa: { address: upiId },
        contact: {
          name: `worker_${workerId}`,
          type: 'employee',
        },
      },
      amount: amount * 100, // Razorpay uses paise
      currency: 'INR',
      mode: 'UPI',
      purpose: 'payout',
      queue_if_low_balance: true,
      reference_id: claim.id,
      narration: `GigGuard ${reason} payout`,
    });
  } catch (err) {
    console.warn('[PayoutService] Razorpay call failed (test mode):', err.message);
    // In test mode, we continue and log the payout anyway
    razorpayPayout = { id: `test_${Date.now()}`, status: 'test_mode' };
  }

  // ── 3. Log to Supabase payouts table ───────────────────
  const { data: payout, error: payoutErr } = await supabase
    .from('payouts')
    .insert({
      claim_id: claim.id,
      worker_id: workerId,
      amount,
      status: razorpayPayout.status === 'test_mode' ? 'test_created' : 'created',
      razorpay_payout_id: razorpayPayout.id,
      reason,
      meta,
    })
    .select()
    .single();

  if (payoutErr) {
    console.error('[PayoutService] payout insert error:', payoutErr.message);
    throw new Error(`Payout log failed: ${payoutErr.message}`);
  }

  console.log(`[PayoutService] payout logged: ${payout.id}  razorpay=${razorpayPayout.id}`);

  // ── 4. Emit Supabase Realtime event ────────────────────
  // Supabase Realtime automatically broadcasts on INSERT if the table
  // has Realtime enabled. We also broadcast on a custom channel for
  // the frontend to subscribe to.
  try {
    const channel = supabase.channel('payouts');
    await channel.send({
      type: 'broadcast',
      event: 'payout_created',
      payload: {
        payoutId: payout.id,
        workerId,
        amount,
        reason,
        createdAt: payout.created_at,
      },
    });
    console.log('[PayoutService] realtime event emitted');
  } catch (err) {
    console.warn('[PayoutService] realtime emit failed:', err.message);
  }

  return payout;
}

module.exports = { trigger };
