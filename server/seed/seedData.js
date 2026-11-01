const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const MembershipPlan = require('../models/MembershipPlan');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const Exercise = require('../models/Exercise');
const WorkoutPlan = require('../models/WorkoutPlan');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');
const { getNormalizedDate } = require('../services/attendanceService');
const { calculateExpiryDate } = require('../services/membershipService');
const logger = require('../utils/logger');

const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    logger.info('Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Member.deleteMany({}),
      Trainer.deleteMany({}),
      MembershipPlan.deleteMany({}),
      Attendance.deleteMany({}),
      Payment.deleteMany({}),
      Exercise.deleteMany({}),
      WorkoutPlan.deleteMany({}),
      Progress.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    logger.info('Collections cleared. Seeding initial data...');

    // 1. Seed Membership Plans
    const plans = await MembershipPlan.create([
      {
        name: 'Monthly Basic',
        durationMonths: 1,
        price: 49,
        description: 'Full access to gym facilities, lockers, and cardio floor.',
        features: ['Locker access', 'Cardio zone', 'Free weights area', '1 Guest pass per month'],
        status: 'active',
      },
      {
        name: 'Quarterly Pro',
        durationMonths: 3,
        price: 129,
        description: 'Includes sauna access, free fitness assessment, and nutrition guide.',
        features: ['All Basic features', 'Sauna & Steam room', '1 Free Trainer consultation', 'Locker reservation'],
        status: 'active',
      },
      {
        name: 'Half-Yearly Elite',
        durationMonths: 6,
        price: 229,
        description: 'Comprehensive fitness journey with group classes and customized plans.',
        features: ['All Pro features', 'Unlimited group classes', 'Monthly body composition scan', 'Towel service'],
        status: 'active',
      },
      {
        name: 'Yearly VIP Platinum',
        durationMonths: 12,
        price: 399,
        description: 'Ultimate fitness experience with dedicated personal trainer sessions and full amenities.',
        features: ['All Elite features', '4 Free Personal Training sessions', 'Free gym merchandise pack', 'VIP lounge access', 'Priority booking'],
        status: 'active',
      },
    ]);
    logger.success(`Seeded ${plans.length} Membership Plans.`);

    // 2. Seed Admin User
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@gym.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 555-0100',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });
    logger.success('Seeded Admin: admin@gym.com / admin123');

    // 3. Seed Trainers
    const trainerUser1 = await User.create({
      name: 'John Miller',
      email: 'trainer.john@gym.com',
      password: 'trainer123',
      role: 'trainer',
      phone: '+1 555-0101',
      avatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=150',
    });

    const trainerUser2 = await User.create({
      name: 'Sarah Connor',
      email: 'trainer.sarah@gym.com',
      password: 'trainer123',
      role: 'trainer',
      phone: '+1 555-0102',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    });

    const trainer1 = await Trainer.create({
      user: trainerUser1._id,
      specialization: 'Strength & Hypertrophy',
      experienceYears: 7,
      phone: '+1 555-0101',
      bio: 'Certified CSCS strength coach specializing in compound powerlifting and athletic conditioning.',
      availability: 'full-time',
      rating: 4.9,
    });

    const trainer2 = await Trainer.create({
      user: trainerUser2._id,
      specialization: 'HIIT & Weight Management',
      experienceYears: 5,
      phone: '+1 555-0102',
      bio: 'Functional fitness specialist helping clients build stamina, lean muscle, and sustainable healthy habits.',
      availability: 'morning',
      rating: 4.8,
    });
    logger.success('Seeded 2 Trainers.');

    // 4. Seed Exercise Catalog
    const exercises = await Exercise.create([
      {
        name: 'Barbell Bench Press',
        category: 'strength',
        targetMuscle: 'Chest',
        equipment: 'Barbell & Flat Bench',
        description: 'Classic compound push exercise targeting pectoralis major and triceps.',
        instructions: ['Retract scapulae', 'Lower bar slowly to mid-chest', 'Press upward explosively'],
      },
      {
        name: 'Barbell Back Squat',
        category: 'strength',
        targetMuscle: 'Quadriceps & Glutes',
        equipment: 'Barbell & Squat Rack',
        description: 'King of lower body exercises developing leg strength and core stability.',
        instructions: ['Feet shoulder-width apart', 'Hinge hips back and descend to parallel', 'Drive through heels'],
      },
      {
        name: 'Conventional Deadlift',
        category: 'strength',
        targetMuscle: 'Posterior Chain',
        equipment: 'Barbell & Bumper Plates',
        description: 'Full-body hinge movement building total body pulling power.',
        instructions: ['Bar over mid-foot', 'Neutral spine', 'Push the floor away'],
      },
      {
        name: 'Pull-ups',
        category: 'strength',
        targetMuscle: 'Latissimus Dorsi',
        equipment: 'Pull-up Bar',
        description: 'Upper body pulling exercise developing broad back and forearm grip.',
        instructions: ['Full grip over bar', 'Pull elbows down toward ribs', 'Controlled descent'],
      },
      {
        name: 'Treadmill HIIT Sprints',
        category: 'cardio',
        targetMuscle: 'Full Body & Cardiovascular',
        equipment: 'Commercial Treadmill',
        description: 'High intensity interval training for maximum calorie expenditure and VO2 max.',
        instructions: ['30 sec all-out sprint', '60 sec recovery walk', 'Repeat for 10 rounds'],
      },
      {
        name: 'Plank Hold',
        category: 'core',
        targetMuscle: 'Rectus Abdominis & Transverse',
        equipment: 'Exercise Mat',
        description: 'Isometric core strengthening movement.',
        instructions: ['Elbows below shoulders', 'Neutral pelvis', 'Hold tension for 60 seconds'],
      },
    ]);
    logger.success(`Seeded ${exercises.length} Exercises.`);

    // 5. Seed Members
    const memberUsers = await Promise.all([
      User.create({
        name: 'Mike Tyson',
        email: 'member.mike@gym.com',
        password: 'member123',
        role: 'member',
        phone: '+1 555-0201',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      }),
      User.create({
        name: 'Emma Watson',
        email: 'member.emma@gym.com',
        password: 'member123',
        role: 'member',
        phone: '+1 555-0202',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      }),
      User.create({
        name: 'David Beckham',
        email: 'member.david@gym.com',
        password: 'member123',
        role: 'member',
        phone: '+1 555-0203',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      }),
      User.create({
        name: 'Lucas Scott',
        email: 'member.lucas@gym.com',
        password: 'member123',
        role: 'member',
        phone: '+1 555-0204',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      }),
    ]);

    const now = new Date();

    // Member 1: Active Yearly VIP
    const member1Start = new Date(now.getFullYear(), now.getMonth() - 2, 10);
    const member1 = await Member.create({
      user: memberUsers[0]._id,
      dob: new Date('1992-05-15'),
      gender: 'male',
      address: '742 Evergreen Terrace, Springfield',
      emergencyContact: { name: 'Rachel Tyson', phone: '+1 555-9988', relation: 'Spouse' },
      joinDate: member1Start,
      membershipPlan: plans[3]._id, // Yearly VIP
      startDate: member1Start,
      expiryDate: calculateExpiryDate(member1Start, 12),
      trainer: trainer1._id,
      status: 'active',
      notes: 'Goal: Compete in local bench press tournament.',
    });

    // Member 2: Active Quarterly Pro
    const member2Start = new Date(now.getFullYear(), now.getMonth() - 1, 5);
    const member2 = await Member.create({
      user: memberUsers[1]._id,
      dob: new Date('1995-09-20'),
      gender: 'female',
      address: '221B Baker St, London',
      emergencyContact: { name: 'George Watson', phone: '+1 555-8877', relation: 'Father' },
      joinDate: member2Start,
      membershipPlan: plans[1]._id, // Quarterly Pro
      startDate: member2Start,
      expiryDate: calculateExpiryDate(member2Start, 3),
      trainer: trainer2._id,
      status: 'active',
      notes: 'Goal: Improve 5k running pace and core stamina.',
    });

    // Member 3: Expiring soon (within 4 days)
    const member3Start = new Date(now.getTime() - 26 * 24 * 60 * 60 * 1000); // 26 days ago
    const member3 = await Member.create({
      user: memberUsers[2]._id,
      dob: new Date('1988-11-02'),
      gender: 'male',
      address: '10 Downing St, London',
      emergencyContact: { name: 'Victoria Beckham', phone: '+1 555-7766', relation: 'Spouse' },
      joinDate: member3Start,
      membershipPlan: plans[0]._id, // Monthly
      startDate: member3Start,
      expiryDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days left
      trainer: trainer1._id,
      status: 'active',
      notes: 'Requested renewal alert message.',
    });

    // Member 4: Expired status
    const member4Start = new Date(now.getFullYear(), now.getMonth() - 4, 1);
    const member4 = await Member.create({
      user: memberUsers[3]._id,
      dob: new Date('1998-03-12'),
      gender: 'male',
      address: '42 Wallaby Way, Sydney',
      emergencyContact: { name: 'Karen Scott', phone: '+1 555-6655', relation: 'Mother' },
      joinDate: member4Start,
      membershipPlan: plans[0]._id,
      startDate: member4Start,
      expiryDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      trainer: null,
      status: 'expired',
      notes: 'Membership expired last month. Outreach scheduled.',
    });

    // Link assigned members to trainers
    await Trainer.findByIdAndUpdate(trainer1._id, {
      $set: { assignedMembers: [member1._id, member3._id] },
    });
    await Trainer.findByIdAndUpdate(trainer2._id, {
      $set: { assignedMembers: [member2._id] },
    });
    logger.success('Seeded 4 Members & linked with Trainers.');

    // 6. Seed Payments
    await Payment.create([
      {
        member: member1._id,
        membershipPlan: plans[3]._id,
        amount: 399,
        paymentDate: member1Start,
        paymentMethod: 'card',
        transactionId: 'TXN-VIP-9901',
        invoiceNumber: 'INV-2026-00101',
        status: 'paid',
        notes: 'Annual Platinum VIP subscription paid in full via Stripe POS.',
      },
      {
        member: member2._id,
        membershipPlan: plans[1]._id,
        amount: 129,
        paymentDate: member2Start,
        paymentMethod: 'upi',
        transactionId: 'TXN-UPI-4482',
        invoiceNumber: 'INV-2026-00102',
        status: 'paid',
        notes: 'Quarterly membership renewed via Google Pay UPI.',
      },
      {
        member: member3._id,
        membershipPlan: plans[0]._id,
        amount: 49,
        paymentDate: member3Start,
        paymentMethod: 'cash',
        transactionId: 'TXN-CSH-1102',
        invoiceNumber: 'INV-2026-00103',
        status: 'paid',
        notes: 'Cash payment received at front desk.',
      },
      {
        member: member4._id,
        membershipPlan: plans[0]._id,
        amount: 49,
        paymentDate: new Date(),
        paymentMethod: 'bank_transfer',
        transactionId: 'TXN-PEND-0033',
        invoiceNumber: 'INV-2026-00104',
        status: 'pending',
        notes: 'Pending bank wire transfer confirmation for renewal.',
      },
    ]);
    logger.success('Seeded Payments & Invoices.');

    // 7. Seed Attendance Records (Past 10 days)
    const attendanceRecords = [];
    for (let i = 0; i < 10; i++) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const normalized = getNormalizedDate(day);

      // Check-in for Member 1
      attendanceRecords.push({
        member: member1._id,
        date: normalized,
        checkInTime: new Date(normalized.getTime() + 8 * 3600000 + 15 * 60000), // 8:15 AM
        checkOutTime: new Date(normalized.getTime() + 9 * 3600000 + 45 * 60000), // 9:45 AM
        status: 'present',
        notes: 'Morning heavy lifting session',
      });

      // Member 2 attends alternating days
      if (i % 2 === 0) {
        attendanceRecords.push({
          member: member2._id,
          date: normalized,
          checkInTime: new Date(normalized.getTime() + 17 * 3600000 + 30 * 60000), // 5:30 PM
          checkOutTime: new Date(normalized.getTime() + 18 * 3600000 + 40 * 60000), // 6:40 PM
          status: 'present',
          notes: 'Evening HIIT session',
        });
      }
    }
    await Attendance.insertMany(attendanceRecords);
    logger.success(`Seeded ${attendanceRecords.length} Attendance records.`);

    // 8. Seed Workout Plans
    await WorkoutPlan.create([
      {
        name: 'Hypertrophy & Power 4-Day Split',
        member: member1._id,
        trainer: trainer1._id,
        goal: 'Muscle Hypertrophy and Core Strength',
        level: 'advanced',
        exercises: [
          {
            exercise: exercises[0]._id,
            name: 'Barbell Bench Press',
            sets: 4,
            reps: 8,
            durationMinutes: 15,
            restSeconds: 90,
            instructions: 'RPE 8. Progressive overload each set.',
          },
          {
            exercise: exercises[1]._id,
            name: 'Barbell Back Squat',
            sets: 4,
            reps: 8,
            durationMinutes: 20,
            restSeconds: 120,
            instructions: 'Focus on full depth and knee tracking.',
          },
          {
            exercise: exercises[2]._id,
            name: 'Conventional Deadlift',
            sets: 3,
            reps: 5,
            durationMinutes: 15,
            restSeconds: 180,
            instructions: 'Reset between every repetition.',
          },
          {
            exercise: exercises[3]._id,
            name: 'Pull-ups',
            sets: 3,
            reps: 10,
            durationMinutes: 10,
            restSeconds: 60,
            instructions: 'Add 5kg weighted belt if possible.',
          },
        ],
        startDate: member1Start,
        notes: 'Designed specifically for annual VIP goals.',
        isActive: true,
      },
      {
        name: 'Lean Definition & Cardio Shred',
        member: member2._id,
        trainer: trainer2._id,
        goal: 'Fat Loss & Athletic Conditioning',
        level: 'intermediate',
        exercises: [
          {
            exercise: exercises[4]._id,
            name: 'Treadmill HIIT Sprints',
            sets: 8,
            reps: 1,
            durationMinutes: 20,
            restSeconds: 60,
            instructions: 'Keep speed at 15 km/h on sprint intervals.',
          },
          {
            exercise: exercises[5]._id,
            name: 'Plank Hold',
            sets: 3,
            reps: 1,
            durationMinutes: 5,
            restSeconds: 45,
            instructions: 'Maintain rigid hollow-body tension.',
          },
        ],
        startDate: member2Start,
        notes: 'Keep rest intervals strictly timed.',
        isActive: true,
      },
    ]);
    logger.success('Seeded Workout Plans.');

    // 9. Seed Progress Logs
    await Progress.create([
      {
        member: member1._id,
        date: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        weightKg: 88.5,
        heightCm: 182,
        measurements: { chestCm: 106, waistCm: 89, hipsCm: 100, armsCm: 38, thighsCm: 61 },
        notes: 'Initial baseline assessment.',
        recordedBy: trainerUser1._id,
      },
      {
        member: member1._id,
        date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        weightKg: 86.0,
        heightCm: 182,
        measurements: { chestCm: 107, waistCm: 86, hipsCm: 99, armsCm: 39, thighsCm: 61 },
        notes: 'Month 1 check-in: Noticeable waist reduction and arm growth.',
        recordedBy: trainerUser1._id,
      },
      {
        member: member1._id,
        date: now,
        weightKg: 84.5,
        heightCm: 182,
        measurements: { chestCm: 108, waistCm: 84, hipsCm: 98, armsCm: 39.5, thighsCm: 62 },
        notes: 'Month 2 check-in: Target weight reached! Lean muscle increase.',
        recordedBy: trainerUser1._id,
      },
      {
        member: member2._id,
        date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        weightKg: 63.0,
        heightCm: 168,
        measurements: { chestCm: 88, waistCm: 72, hipsCm: 94, armsCm: 28, thighsCm: 54 },
        notes: 'Initial check-in.',
        recordedBy: trainerUser2._id,
      },
      {
        member: member2._id,
        date: now,
        weightKg: 61.2,
        heightCm: 168,
        measurements: { chestCm: 87, waistCm: 69, hipsCm: 92, armsCm: 28.5, thighsCm: 53 },
        notes: 'Great stamina progress on treadmill splits.',
        recordedBy: trainerUser2._id,
      },
    ]);
    logger.success('Seeded Progress Logs.');

    // 10. Seed System Notifications
    await Notification.create([
      {
        recipient: null, // Broadcast to all
        title: 'Gym Renovation & New Equipment',
        message: 'We have installed brand new Olympic lifting platforms and Rogue barbells in Zone B!',
        type: 'info',
      },
      {
        recipient: memberUsers[0]._id,
        title: 'Workout Plan Updated',
        message: 'Coach John Miller updated your Hypertrophy & Power split for week 9.',
        type: 'workout',
      },
      {
        recipient: memberUsers[2]._id,
        title: 'Membership Expiring Soon',
        message: 'Your Monthly Basic plan will expire in 4 days. Please renew to keep full gym access.',
        type: 'alert',
      },
      {
        recipient: memberUsers[0]._id,
        title: 'Payment Invoice INV-2026-00101 Generated',
        message: 'Thank you for your Yearly VIP Platinum payment. Your invoice is available in your portal.',
        type: 'payment',
      },
    ]);
    logger.success('Seeded System Notifications.');

    logger.success('================================================================');
    logger.success('  Database seeding completed successfully!');
    logger.success('  Credentials:');
    logger.success('  - Admin:   admin@gym.com / admin123');
    logger.success('  - Trainer: trainer.john@gym.com / trainer123');
    logger.success('  - Trainer: trainer.sarah@gym.com / trainer123');
    logger.success('  - Member:  member.mike@gym.com / member123');
    logger.success('  - Member:  member.emma@gym.com / member123');
    logger.success('================================================================');

    if (require.main === module) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (error) {
    logger.error('Seeding failed:', error);
    if (require.main === module) {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
