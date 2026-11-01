const Member = require('../models/Member');
const MembershipPlan = require('../models/MembershipPlan');

/**
 * Calculates the expiration date given a start date and duration in months.
 * Handles month-end wrapping accurately.
 */
const calculateExpiryDate = (startDate, durationMonths) => {
  const date = new Date(startDate || Date.now());
  const originalDay = date.getDate();
  // Move to day 1 first so setMonth never overflows (e.g. Jan 31 + 1 month -> Mar 3).
  date.setDate(1);
  date.setMonth(date.getMonth() + parseInt(durationMonths, 10));
  const lastDayOfTargetMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(originalDay, lastDayOfTargetMonth));
  return date;
};

/**
 * Syncs membership status for a single member based on expiryDate
 */
const syncMemberStatus = async (memberId) => {
  const member = await Member.findById(memberId);
  if (!member) return null;

  const now = new Date();
  if (member.expiryDate && new Date(member.expiryDate) < now) {
    if (member.status === 'active') {
      member.status = 'expired';
      await member.save();
    }
  }
  return member;
};

/**
 * Syncs status for all members across the gym
 */
const syncAllMembersStatus = async () => {
  const now = new Date();
  await Member.updateMany(
    {
      expiryDate: { $lt: now },
      status: 'active',
    },
    {
      $set: { status: 'expired' },
    }
  );
};

/**
 * Assigns or renews a membership plan for a member
 */
const assignMembership = async (memberId, planId, customStartDate = null) => {
  const plan = await MembershipPlan.findById(planId);
  if (!plan) {
    throw new Error('Membership plan not found');
  }

  const member = await Member.findById(memberId);
  if (!member) {
    throw new Error('Member not found');
  }

  const hasRemainingTime = !customStartDate && member.expiryDate && new Date(member.expiryDate) > new Date();
  const startDate = customStartDate ? new Date(customStartDate) : (hasRemainingTime ? new Date(member.expiryDate) : new Date());
  const expiryDate = calculateExpiryDate(startDate, plan.durationMonths);

  member.membershipPlan = plan._id;
  if (!hasRemainingTime) member.startDate = startDate;
  member.expiryDate = expiryDate;
  member.status = 'active';

  await member.save();
  return member;
};

module.exports = {
  calculateExpiryDate,
  syncMemberStatus,
  syncAllMembersStatus,
  assignMembership,
};
