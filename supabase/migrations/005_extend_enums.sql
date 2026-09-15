-- Add CRITICAL to risk_level (between HIGH and CRITICAL)
alter type public.risk_level add value if not exists 'CRITICAL';

-- Add EMERGENCY to referral urgency
-- (urgency is text, no enum, so just document accepted values)
comment on column public.referrals.urgency is
  'Accepted: ROUTINE | URGENT | EMERGENCY';

-- Add PENDING and REDIRECTED to referral_status
alter type public.referral_status add value if not exists 'PENDING';
alter type public.referral_status add value if not exists 'REDIRECTED';
