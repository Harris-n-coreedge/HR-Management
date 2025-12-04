/**
 * HR MANAGEMENT SYSTEM - MONGODB SCHEMA
 * Company: Core Edge Solutions
 * 
 * Collections:
 * 1. departments
 * 2. employees
 * 3. attendance
 * 4. leaves
 * 5. salaries
 * 6. salary_slips
 * 7. biometric_logs
 * 8. settings
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// ============================================
// 1. DEPARTMENTS COLLECTION
// ============================================
const DepartmentSchema = new Schema({
  departmentId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    enum: [
      'Sales',
      'Developers',
      'HR',
      'Design and Media',
      'Data Entry',
      'SEO',
      'Content Writers',
      'Other' // For future departments
    ]
  },
  customName: {
    type: String, // For 'Other' department type
    trim: true
  },
  description: String,
  headOfDepartment: {
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  },
  employeeCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
DepartmentSchema.index({ departmentId: 1, isActive: 1 });

// ============================================
// 2. EMPLOYEES COLLECTION
// ============================================
const EmployeeSchema = new Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true
    },
    alternatePhone: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other']
    },
    bloodGroup: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },
  
  employmentDetails: {
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    designation: {
      type: String,
      required: true
    },
    employeeType: {
      type: String,
      enum: ['Full-Time', 'Part-Time', 'Contract', 'Intern'],
      required: true
    },
    joiningDate: {
      type: Date,
      required: true
    },
    confirmationDate: Date,
    probationPeriod: {
      type: Number, // in months
      default: 3
    },
    reportingManager: {
      type: Schema.Types.ObjectId,
      ref: 'Employee'
    },
    workLocation: {
      type: String,
      enum: ['Office', 'Remote', 'Hybrid'],
      default: 'Office'
    }
  },
  
  salaryInfo: {
    basicSalary: {
      type: Number,
      required: true
    },
    allowances: {
      houseRent: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    deductions: {
      tax: { type: Number, default: 0 },
      providentFund: { type: Number, default: 0 },
      insurance: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      bankName: String,
      branchName: String,
      ifscCode: String
    }
  },
  
  biometricInfo: {
    biometricId: {
      type: String,
      unique: true,
      sparse: true // Allows null values while maintaining uniqueness
    },
    fingerprintRegistered: {
      type: Boolean,
      default: false
    },
    lastSyncedAt: Date
  },
  
  status: {
    type: String,
    enum: ['Active', 'On Leave', 'Terminated', 'Resigned', 'Suspended'],
    default: 'Active'
  },
  
  terminationDetails: {
    terminationDate: Date,
    reason: String,
    lastWorkingDay: Date,
    remarks: String
  },
  
  documents: [{
    documentType: {
      type: String,
      enum: ['Resume', 'ID Proof', 'Address Proof', 'Education Certificate', 'Experience Letter', 'Other']
    },
    documentName: String,
    documentUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  leaveBalance: {
    casual: { type: Number, default: 12 },
    sick: { type: Number, default: 10 },
    annual: { type: Number, default: 15 },
    unpaid: { type: Number, default: 0 }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
EmployeeSchema.index({ employeeId: 1 });
EmployeeSchema.index({ 'personalInfo.email': 1 });
EmployeeSchema.index({ 'employmentDetails.department': 1, status: 1 });
EmployeeSchema.index({ 'biometricInfo.biometricId': 1 });
EmployeeSchema.index({ status: 1 });

// Virtual for full name
EmployeeSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// ============================================
// 3. ATTENDANCE COLLECTION
// ============================================
const AttendanceSchema = new Schema({
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    time: Date,
    location: String,
    source: {
      type: String,
      enum: ['Biometric', 'Manual', 'System'],
      default: 'Biometric'
    },
    ipAddress: String
  },
  checkOut: {
    time: Date,
    location: String,
    source: {
      type: String,
      enum: ['Biometric', 'Manual', 'System'],
      default: 'Biometric'
    },
    ipAddress: String
  },
  breaks: [{
    breakIn: {
      time: Date,
      reason: String
    },
    breakOut: {
      time: Date
    },
    duration: Number // in minutes
  }],
  totalWorkHours: Number, // in hours
  totalBreakTime: Number, // in minutes
  workType: {
    type: String,
    enum: ['Office', 'Remote', 'Field'],
    default: 'Office'
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half Day', 'Late', 'On Leave', 'Holiday', 'Weekend'],
    default: 'Present'
  },
  lateArrival: {
    isLate: { type: Boolean, default: false },
    lateByMinutes: { type: Number, default: 0 }
  },
  earlyDeparture: {
    isEarly: { type: Boolean, default: false },
    earlyByMinutes: { type: Number, default: 0 }
  },
  overtime: {
    hours: { type: Number, default: 0 },
    approved: { type: Boolean, default: false }
  },
  remarks: String,
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for unique attendance per employee per day
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ date: 1, status: 1 });
AttendanceSchema.index({ employee: 1, date: -1 });

// ============================================
// 4. LEAVES COLLECTION
// ============================================
const LeaveSchema = new Schema({
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  leaveType: {
    type: String,
    enum: ['Casual', 'Sick', 'Annual', 'Unpaid', 'Maternity', 'Paternity', 'Compensatory'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  numberOfDays: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Pending'
  },
  appliedOn: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  },
  approvedOn: Date,
  rejectionReason: String,
  supportingDocuments: [{
    documentName: String,
    documentUrl: String,
    uploadedAt: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
LeaveSchema.index({ employee: 1, startDate: -1 });
LeaveSchema.index({ status: 1, appliedOn: -1 });
LeaveSchema.index({ startDate: 1, endDate: 1 });

// ============================================
// 5. SALARIES COLLECTION
// ============================================
const SalarySchema = new Schema({
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  earnings: {
    basicSalary: {
      type: Number,
      required: true
    },
    houseRentAllowance: { type: Number, default: 0 },
    medicalAllowance: { type: Number, default: 0 },
    transportAllowance: { type: Number, default: 0 },
    otherAllowances: { type: Number, default: 0 },
    overtime: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    incentives: { type: Number, default: 0 }
  },
  deductions: {
    tax: { type: Number, default: 0 },
    providentFund: { type: Number, default: 0 },
    insurance: { type: Number, default: 0 },
    loanDeduction: { type: Number, default: 0 },
    lateDeduction: { type: Number, default: 0 },
    absentDeduction: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 }
  },
  attendance: {
    totalWorkingDays: { type: Number, required: true },
    presentDays: { type: Number, required: true },
    absentDays: { type: Number, default: 0 },
    leaveDays: { type: Number, default: 0 },
    halfDays: { type: Number, default: 0 },
    paidLeaveDays: { type: Number, default: 0 }
  },
  grossSalary: {
    type: Number,
    required: true
  },
  totalDeductions: {
    type: Number,
    required: true
  },
  netSalary: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Paid', 'On Hold'],
    default: 'Pending'
  },
  paymentDate: Date,
  paymentMethod: {
    type: String,
    enum: ['Bank Transfer', 'Cash', 'Cheque']
  },
  transactionId: String,
  remarks: String,
  generatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for unique salary per employee per month/year
SalarySchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });
SalarySchema.index({ year: -1, month: -1 });
SalarySchema.index({ paymentStatus: 1 });

// ============================================
// 6. SALARY SLIPS COLLECTION
// ============================================
const SalarySlipSchema = new Schema({
  salary: {
    type: Schema.Types.ObjectId,
    ref: 'Salary',
    required: true
  },
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  slipNumber: {
    type: String,
    required: true,
    unique: true
  },
  month: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  pdfUrl: String, // URL to stored PDF
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: Date,
  emailStatus: {
    type: String,
    enum: ['Not Sent', 'Sent', 'Failed', 'Bounced']
  },
  downloadedAt: [Date], // Array to track multiple downloads
  downloadCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
SalarySlipSchema.index({ employee: 1, year: -1, month: -1 });
SalarySlipSchema.index({ slipNumber: 1 });
SalarySlipSchema.index({ emailSent: 1 });

// ============================================
// 7. BIOMETRIC LOGS COLLECTION
// ============================================
const BiometricLogSchema = new Schema({
  biometricId: {
    type: String,
    required: true
  },
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  },
  logType: {
    type: String,
    enum: ['CheckIn', 'CheckOut', 'BreakIn', 'BreakOut'],
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  deviceId: String,
  deviceLocation: String,
  processed: {
    type: Boolean,
    default: false
  },
  processedAt: Date,
  attendanceRecord: {
    type: Schema.Types.ObjectId,
    ref: 'Attendance'
  },
  rawData: Schema.Types.Mixed, // Store raw biometric data if needed
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
BiometricLogSchema.index({ biometricId: 1, timestamp: -1 });
BiometricLogSchema.index({ processed: 1, timestamp: 1 });
BiometricLogSchema.index({ employee: 1, timestamp: -1 });

// ============================================
// 8. SETTINGS COLLECTION
// ============================================
const SettingsSchema = new Schema({
  category: {
    type: String,
    required: true,
    unique: true,
    enum: [
      'WorkingHours',
      'LeavePolicy',
      'AttendanceRules',
      'SalaryStructure',
      'EmailConfiguration',
      'BiometricSettings',
      'Holidays',
      'General'
    ]
  },
  settings: {
    type: Schema.Types.Mixed,
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Example settings structure:
/*
WorkingHours: {
  startTime: "09:00",
  endTime: "18:00",
  lateGracePeriod: 15, // minutes
  halfDayHours: 4,
  fullDayHours: 8
}

LeavePolicy: {
  casual: 12,
  sick: 10,
  annual: 15,
  carryForward: true,
  maxCarryForward: 5
}

AttendanceRules: {
  autoCheckout: true,
  autoCheckoutTime: "19:00",
  weekends: ["Saturday", "Sunday"],
  overtimeApprovalRequired: true
}

Holidays: {
  holidays: [
    { date: "2024-01-26", name: "Republic Day", type: "National" },
    { date: "2024-08-15", name: "Independence Day", type: "National" }
  ]
}
*/

// ============================================
// 9. AUDIT LOG COLLECTION (Optional but Recommended)
// ============================================
const AuditLogSchema = new Schema({
  action: {
    type: String,
    required: true
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  targetEmployee: {
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  },
  collection: String,
  documentId: Schema.Types.ObjectId,
  changes: Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

AuditLogSchema.index({ performedBy: 1, timestamp: -1 });
AuditLogSchema.index({ targetEmployee: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });

// ============================================
// MODEL EXPORTS
// ============================================
const Department = mongoose.model('Department', DepartmentSchema);
const Employee = mongoose.model('Employee', EmployeeSchema);
const Attendance = mongoose.model('Attendance', AttendanceSchema);
const Leave = mongoose.model('Leave', LeaveSchema);
const Salary = mongoose.model('Salary', SalarySchema);
const SalarySlip = mongoose.model('SalarySlip', SalarySlipSchema);
const BiometricLog = mongoose.model('BiometricLog', BiometricLogSchema);
const Settings = mongoose.model('Settings', SettingsSchema);
const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

module.exports = {
  Department,
  Employee,
  Attendance,
  Leave,
  Salary,
  SalarySlip,
  BiometricLog,
  Settings,
  AuditLog
};
