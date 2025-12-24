
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { LayoutDashboard, Table, Settings, Save, Download, FileSpreadsheet, Printer, LogOut, ChevronDown, FileText, UserPlus, FilePlus, Building, Users, Calculator, PieChart, MapPin, Trophy, Languages, Percent } from 'lucide-react';
import { MOCK_BRANCHES, MOCK_EMPLOYEES, MOCK_ACCOUNT_OPENINGS, MOCK_USERS } from './services/mockData';
import { SalaryEntry, SalarySheet, SalaryRow, User, Employee, AccountOpening, Branch, CenterCollectionRecord, Center, CommissionStructure, DEFAULT_COMMISSION_RATES } from './types';
import { createEmptyEntry, recalculateEntry } from './services/logic';
import { exportToCSV } from './services/exportService';
import { translations, Language } from './services/translations';
import Dashboard from './components/Dashboard';
import SalaryTable from './components/SalaryTable';
import AccountReport from './components/AccountReport';
import AddEmployeeForm from './components/AddEmployeeForm';
import AddAccountForm from './components/AddAccountForm';
import ManageBranches from './components/ManageBranches';
import ManageUsers from './components/ManageUsers';
import CenterCalculation from './components/CenterCalculation';
import CenterReport from './components/CenterReport';
import ManageCenters from './components/ManageCenters';
import Leaderboard from './components/Leaderboard';
import ManageCommissions from './components/ManageCommissions';
import Login from './components/Login';

enum View {
  DASHBOARD = 'DASHBOARD',
  SHEET = 'SHEET',
  REPORT = 'REPORT',
  CENTER_REPORT = 'CENTER_REPORT',
  ADD_EMPLOYEE = 'ADD_EMPLOYEE',
  ADD_ACCOUNT = 'ADD_ACCOUNT',
  MANAGE_BRANCHES = 'MANAGE_BRANCHES',
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_CENTERS = 'MANAGE_CENTERS',
  MANAGE_COMMISSIONS = 'MANAGE_COMMISSIONS',
  CENTER_CALC = 'CENTER_CALC',
  LEADERBOARD = 'LEADERBOARD',
}

const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

const App: React.FC = () => {
  // Auth State with Persistence
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('salary_app_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('salary_app_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('salary_app_user');
    }
  }, [user]);

  // Determine permissions derived from Role
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isManager = user?.role === 'MANAGER';
  const isNormalUser = user?.role === 'USER';

  // Language State with Persistence
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('salary_app_language') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('salary_app_language', language);
  }, [language]);

  const t = translations[language];

  // View State with Persistence
  const [currentView, setCurrentView] = useState<View>(() => {
     return (localStorage.getItem('salary_app_view') as View) || View.DASHBOARD;
  });

  useEffect(() => {
    localStorage.setItem('salary_app_view', currentView);
  }, [currentView]);
  
  // Selection State with Persistence
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return localStorage.getItem('salary_app_month') || new Date().toISOString().slice(0, 7);
  });

  useEffect(() => {
    localStorage.setItem('salary_app_month', selectedMonth);
  }, [selectedMonth]);

  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('salary_app_selected_branches');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Effect: Enforce Single Branch selection for MANAGER/USER roles on Login/Load
  useEffect(() => {
     if ((isManager || isNormalUser) && user?.branch_id) {
         setSelectedBranchIds([user.branch_id]);
     }
  }, [user, isManager, isNormalUser]);

  useEffect(() => {
    localStorage.setItem('salary_app_selected_branches', JSON.stringify(selectedBranchIds));
  }, [selectedBranchIds]);

  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Data State with Persistence
  const [currentSheet, setCurrentSheet] = useState<SalarySheet | null>(() => {
    try {
      const saved = localStorage.getItem('salary_app_current_sheet');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (currentSheet) localStorage.setItem('salary_app_current_sheet', JSON.stringify(currentSheet));
    else localStorage.removeItem('salary_app_current_sheet');
  }, [currentSheet]);

  const [entries, setEntries] = useState<SalaryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('salary_app_entries');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('salary_app_entries', JSON.stringify(entries));
  }, [entries]);

  const [isGenerated, setIsGenerated] = useState<boolean>(() => {
    return localStorage.getItem('salary_app_is_generated') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('salary_app_is_generated', String(isGenerated));
  }, [isGenerated]);

  // Center Collection Records Persistence
  const [centerRecords, setCenterRecords] = useState<CenterCollectionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('salary_app_center_records');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('salary_app_center_records', JSON.stringify(centerRecords));
  }, [centerRecords]);

  // Centers Master Data Persistence
  const [centers, setCenters] = useState<Center[]>(() => {
    try {
      const saved = localStorage.getItem('salary_app_centers');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('salary_app_centers', JSON.stringify(centers));
  }, [centers]);

  // Commission Rates Persistence
  const [commissionRates, setCommissionRates] = useState<Record<string, CommissionStructure>>(() => {
    try {
      const saved = localStorage.getItem('salary_app_comm_rates');
      return saved ? JSON.parse(saved) : DEFAULT_COMMISSION_RATES;
    } catch { return DEFAULT_COMMISSION_RATES; }
  });

  useEffect(() => {
    localStorage.setItem('salary_app_comm_rates', JSON.stringify(commissionRates));
  }, [commissionRates]);

  // Dynamic Data Stores
  const [branches, setBranches] = useState<Branch[]>(() => {
    try {
      const saved = localStorage.getItem('salary_app_branches');
      return saved ? JSON.parse(saved) : MOCK_BRANCHES;
    } catch (e) {
      return MOCK_BRANCHES;
    }
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem('salary_app_employees');
      return saved ? JSON.parse(saved) : MOCK_EMPLOYEES;
    } catch (e) {
      return MOCK_EMPLOYEES;
    }
  });

  const [accounts, setAccounts] = useState<AccountOpening[]>(() => {
    try {
      const saved = localStorage.getItem('salary_app_accounts');
      return saved ? JSON.parse(saved) : MOCK_ACCOUNT_OPENINGS;
    } catch (e) {
      return MOCK_ACCOUNT_OPENINGS;
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('salary_app_users');
      return saved ? JSON.parse(saved) : MOCK_USERS;
    } catch {
      return MOCK_USERS;
    }
  });

  // Persistence Effects
  useEffect(() => { localStorage.setItem('salary_app_branches', JSON.stringify(branches)); }, [branches]);
  useEffect(() => { localStorage.setItem('salary_app_employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('salary_app_accounts', JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem('salary_app_users', JSON.stringify(users)); }, [users]);

  // Can Edit Salary Sheet?
  const canEditSheet = isSuperAdmin; 
  const isSheetReadOnly = !canEditSheet;

  // Filter Data based on Role for Child Components
  const visibleBranches = useMemo(() => {
    if (isSuperAdmin) return branches;
    if ((isManager || isNormalUser) && user?.branch_id) return branches.filter(b => b.id === user.branch_id);
    return [];
  }, [branches, user, isSuperAdmin, isManager, isNormalUser]);

  const visibleEmployees = useMemo(() => {
    if (isNormalUser && user?.employee_id) return employees.filter(e => e.id === user.employee_id);
    if (isSuperAdmin) return employees;
    if (isManager && user?.branch_id) return employees.filter(e => e.branch_id === user.branch_id);
    return [];
  }, [employees, user, isSuperAdmin, isManager, isNormalUser]);

  const visibleAccounts = useMemo(() => {
    if (isSuperAdmin) return accounts;
    if (isManager && user?.branch_id) return accounts.filter(a => a.branch_id === user.branch_id);
    if (isNormalUser && user?.employee_id) return accounts.filter(a => a.opened_by_employee_id === user.employee_id);
    return [];
  }, [accounts, user, isSuperAdmin, isManager, isNormalUser]);
  
  // Filter Centers based on user role (for entry pages)
  const visibleCenters = useMemo(() => {
      if (isSuperAdmin) return centers;
      if (isManager && user?.branch_id) return centers.filter(c => c.branchId === user.branch_id);
      if (isNormalUser && user?.branch_id) return centers.filter(c => c.branchId === user.branch_id);
      return [];
  }, [centers, user, isSuperAdmin, isManager, isNormalUser]);


  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBranchDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate Logic
  const handleGenerate = () => {
    if (isNormalUser) {
        alert("Access Denied.");
        return;
    }

    // Managers default to their branch
    let targetBranches = selectedBranchIds;
    if (isManager && user?.branch_id) {
       targetBranches = [user.branch_id];
       setSelectedBranchIds(targetBranches);
    }

    if (targetBranches.length === 0) {
      alert("Please select at least one branch.");
      return;
    }

    const newSheet: SalarySheet = {
      id: generateId(),
      month: selectedMonth,
      branch_ids: targetBranches,
      created_at: new Date().toISOString()
    };

    const targetEmployees = employees.filter(e => targetBranches.includes(e.branch_id));
    
    const newEntries = targetEmployees.map(emp => {
        return recalculateEntry(
          createEmptyEntry(newSheet.id, emp.id, emp.base_salary, emp.commission_type), 
          emp.base_salary,
          commissionRates
        );
    });

    setCurrentSheet(newSheet);
    setEntries(newEntries);
    setIsGenerated(true);
    setCurrentView(View.SHEET);
  };

  const handleUpdateRow = (updatedEntry: SalaryEntry) => {
    setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
  };

  const handleAccountScanned = (code: string) => {
    const normalizedCode = code.trim().toLowerCase();
    setAccounts(prevAccounts => prevAccounts.map(acc => {
      if (acc.account_code.toLowerCase() === normalizedCode) {
        return {
          ...acc,
          is_counted: true,
          counted_month: selectedMonth,
          salary_sheet_id: currentSheet ? currentSheet.id : null
        };
      }
      return acc;
    }));
  };

  const handleSave = () => {
    alert("Salary Sheet Saved Successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if(!isGenerated) return;
    exportToCSV(gridRows, `Salary_Sheet_${selectedMonth}`);
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedBranchIds([]); // Reset selection
  };

  // Center Calculation Handler
  const handleAddCenterRecord = (record: Omit<CenterCollectionRecord, 'id' | 'createdAt'>) => {
    const newRecord: CenterCollectionRecord = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      ...record
    };
    setCenterRecords(prev => [...prev, newRecord]);
  };

  const handleEditCenterRecord = (id: string, updatedRecord: Partial<CenterCollectionRecord>) => {
    setCenterRecords(prev => prev.map(r => r.id === id ? { ...r, ...updatedRecord } : r));
  };

  const handleDeleteCenterRecord = (id: string) => {
    setCenterRecords(prev => prev.filter(r => r.id !== id));
  };

  // Center Management Handlers
  const handleAddCenter = (center: Omit<Center, 'id'>) => {
    const newCenter: Center = { ...center, id: generateId() };
    setCenters(prev => [...prev, newCenter]);
  };

  const handleBulkAddCenters = (newCenters: Omit<Center, 'id'>[]) => {
    const centersToAdd = newCenters.map(c => ({ ...c, id: generateId() }));
    setCenters(prev => [...prev, ...centersToAdd]);
    alert(`Successfully imported ${centersToAdd.length} centers.`);
  };

  const handleEditCenter = (id: string, updatedCenter: Partial<Center>) => {
    setCenters(prev => prev.map(c => c.id === id ? { ...c, ...updatedCenter } : c));
  };

  const handleDeleteCenter = (id: string) => {
    setCenters(prev => prev.filter(c => c.id !== id));
  };


  // ----------------------------------------------
  // EMPLOYEE Management Handlers
  // ----------------------------------------------
  const handleAddEmployee = (empData: Omit<Employee, 'id'> & { id?: string }) => {
    if (isNormalUser) {
        alert("Access Denied: You cannot add employees.");
        return;
    }
    // Security: Force branch ID if manager
    if (isManager && user?.branch_id && empData.branch_id !== user.branch_id) {
       alert("Error: You can only add employees to your assigned branch.");
       return;
    }
    
    // Check if ID exists if manually provided
    if (empData.id && employees.some(e => e.id === empData.id)) {
        alert("Error: Employee ID already exists.");
        return;
    }

    const newEmployee: Employee = { 
        ...empData, 
        id: empData.id || generateId() 
    };
    setEmployees([...employees, newEmployee]);
    alert("Employee Added Successfully");
    setCurrentView(View.ADD_EMPLOYEE); // Stay on page or go to dashboard
  };

  const handleBulkAddEmployees = (newEmployees: Employee[]) => {
    if (isNormalUser) return;

    let validEmployees = newEmployees;
    if (isManager && user?.branch_id) {
        validEmployees = newEmployees.filter(e => e.branch_id === user.branch_id);
        if (validEmployees.length < newEmployees.length) {
            alert(`Filtered ${newEmployees.length - validEmployees.length} employees from other branches.`);
        }
    }
    setEmployees([...employees, ...validEmployees]);
    setCurrentView(View.ADD_EMPLOYEE);
  };
  
  const handleEditEmployee = (id: string, updatedData: Partial<Employee>) => {
    // Only Admin or Manager (own branch) can edit
    if (isNormalUser) return;
    
    // Check ownership if Manager
    const target = employees.find(e => e.id === id);
    if (isManager && user?.branch_id && target?.branch_id !== user.branch_id) {
         alert("Access Denied: Cannot edit employee from another branch.");
         return;
    }

    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...updatedData } : emp));
  };

  const handleDeleteEmployee = (id: string) => {
    // 1. Permission Check
    if (isNormalUser) {
        alert("Access Denied.");
        return;
    }

    // 2. Find Employee
    const employeeToDelete = employees.find(e => e.id === id);
    if (!employeeToDelete) return;

    // 3. Manager Restriction: Can only delete from their own branch
    if (isManager && user?.branch_id) {
        if (employeeToDelete.branch_id !== user.branch_id) {
            alert("Access Denied: You can only delete employees from your assigned branch.");
            return;
        }
    }

    // 4. Perform Delete
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  // ----------------------------------------------
  // ACCOUNT Management Handlers
  // ----------------------------------------------
  const handleAddAccount = (accData: Omit<AccountOpening, 'id'>) => {
    // Both Manager and User can add accounts to their branch
    if (user?.branch_id && accData.branch_id !== user.branch_id) {
        alert("Error: You can only add accounts to your assigned branch.");
        return;
    }

    // Normal User can only add accounts opened by themselves
    if (isNormalUser && user?.employee_id && accData.opened_by_employee_id !== user.employee_id) {
        alert("Error: You can only register accounts opened by yourself.");
        return;
    }

    const newAccount: AccountOpening = { ...accData, id: Date.now() };
    setAccounts([...accounts, newAccount]);
    alert("Account Added Successfully");
    setCurrentView(View.REPORT);
  };

  const handleBulkAddAccounts = (newAccountsData: Omit<AccountOpening, 'id'>[]) => {
    let validAccounts = newAccountsData;
    
    // Filter for Manager/User Branch
    if ((isManager || isNormalUser) && user?.branch_id) {
        validAccounts = validAccounts.filter(a => a.branch_id === user.branch_id);
    }
    
    // Filter for Normal User Ownership
    if (isNormalUser && user?.employee_id) {
         validAccounts = validAccounts.filter(a => a.opened_by_employee_id === user.employee_id);
    }

    const newAccounts = validAccounts.map((data, index) => ({
      ...data,
      id: Date.now() + index
    }));
    
    setAccounts([...accounts, ...newAccounts]);
    alert(`Successfully imported ${newAccounts.length} accounts.`);
    setCurrentView(View.REPORT);
  };

  const handleEditAccount = (id: number, updatedData: Partial<AccountOpening>) => {
    // User cannot edit
    if (isNormalUser) {
        alert("Access Denied: You cannot edit accounts.");
        return;
    }
    // Manager check branch
    const target = accounts.find(a => a.id === id);
    if (isManager && user?.branch_id && target?.branch_id !== user.branch_id) {
        alert("Access Denied: Branch mismatch.");
        return;
    }

    setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, ...updatedData } : acc));
  };

  const handleDeleteAccount = (id: number) => {
      if (!isSuperAdmin) {
          alert("Access Denied: Only Super Admin can delete accounts.");
          return;
      }
      setAccounts(prev => prev.filter(acc => acc.id !== id));
  };

  // ----------------------------------------------
  // BRANCH Management (Super Admin Only)
  // ----------------------------------------------
  const handleAddBranch = (data: { name: string, address?: string, phone?: string }) => {
    if (!isSuperAdmin) return;
    const newBranch: Branch = { id: generateId(), ...data };
    setBranches([...branches, newBranch]);
  };

  const handleBulkAddBranches = (newBranches: { name: string, address?: string, phone?: string }[]) => {
    if (!isSuperAdmin) return;
    const branchesToAdd = newBranches.map(b => ({ id: generateId(), ...b }));
    setBranches([...branches, ...branchesToAdd]);
    alert(`Imported ${branchesToAdd.length} branches.`);
  };

  const handleEditBranch = (id: string, data: { name: string, address?: string, phone?: string }) => {
    if (!isSuperAdmin) return;
    setBranches(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
  };

  const handleDeleteBranch = (id: string) => {
    if (!isSuperAdmin) return;
    setBranches(prev => prev.filter(b => b.id !== id));
  };

  // ----------------------------------------------
  // USER Management (Super Admin Only)
  // ----------------------------------------------
  const handleAddUser = (userData: Omit<User, 'id'>) => {
    if (!isSuperAdmin) return;
    const newUser: User = { ...userData, id: generateId() };
    setUsers([...users, newUser]);
  };

  const handleEditUser = (id: string, updatedData: Partial<User>) => {
    if (!isSuperAdmin) return;
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updatedData } : u));
  };

  const handleDeleteUser = (id: string) => {
    if (!isSuperAdmin) return;
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // Grid Construction with Filtering (Dashboard/Sheet)
  const gridRows: SalaryRow[] = useMemo(() => {
    if (isNormalUser) return []; // Users don't see salary sheet

    // 1. Pre-calculate Center Aggregations efficiently
    const recordsByEmp: Record<string, CenterCollectionRecord[]> = {};
    centerRecords.forEach(r => {
      if (!recordsByEmp[r.employeeId]) recordsByEmp[r.employeeId] = [];
      recordsByEmp[r.employeeId].push(r);
    });

    return entries.map(entry => {
      const employee = employees.find(e => e.id === entry.employee_id);
      if (!employee) return null;
      
      // Filter visible rows based on role
      if (isManager && user?.branch_id && employee.branch_id !== user.branch_id) return null;

      const branch = branches.find(b => b.id === employee.branch_id) || { id: 'unknown', name: 'Unknown' };

      // 2. AGGREGATION LOGIC: Calculate Own/Office collections on the fly
      const empRecords = recordsByEmp[entry.employee_id] || [];
      
      const ownRecords = empRecords.filter(r => r.type === 'OWN');
      const own_somity_collection = ownRecords.reduce((sum, r) => sum + r.amount, 0);
      const own_somity_count = new Set(ownRecords.map(r => r.centerCode)).size;

      const offRecords = empRecords.filter(r => r.type === 'OFFICE');
      const office_somity_collection = offRecords.reduce((sum, r) => sum + r.amount, 0);
      const office_somity_count = new Set(offRecords.map(r => r.centerCode)).size;

      // New: Aggregated Loan Collection
      const total_loan_collection = empRecords.reduce((sum, r) => sum + (r.loanAmount || 0), 0);

      // 3. Inject calculated values and Recalculate Logic
      // This ensures commission and totals are always consistent with the center records
      const calculatedEntry = recalculateEntry({
        ...entry,
        own_somity_collection,
        own_somity_count,
        office_somity_collection,
        office_somity_count,
        total_loan_collection // Pass this for reference/leaderboard
      }, 
      employee.base_salary,
      commissionRates,
      entry.commission_type || employee.commission_type || 'A' // Apply Commission Type from Entry first, else Employee
      );

      return { ...calculatedEntry, employee, branch };
    }).filter((row): row is SalaryRow => row !== null);
  }, [entries, employees, branches, isManager, isNormalUser, user, centerRecords, commissionRates]); 

  const toggleBranch = (id: string) => {
    setSelectedBranchIds(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  // Login View
  if (!user) {
    return <Login onLogin={setUser} users={users} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 no-print flex flex-col shadow-xl z-30">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-blue-400">Salary<span className="text-white">Manager</span></h1>
          <p className="text-xs text-slate-500 mt-1">Multi-Branch System <span className="text-slate-600 font-medium">by diviX</span></p>
        </div>
        
        {/* User Profile */}
        <div className="px-6 py-4 flex items-center space-x-3 bg-slate-800/50 border-b border-slate-800">
          <img src={user.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-slate-600" />
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
            <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">
              {user.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : user.role}
            </p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase px-4 py-2">Menu</div>
          <button onClick={() => setCurrentView(View.DASHBOARD)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentView === View.DASHBOARD ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </button>
          
          {/* Normal User CANNOT see Salary Sheet */}
          {!isNormalUser && (
            <button onClick={() => setCurrentView(View.SHEET)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentView === View.SHEET ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <Table size={20} /> <span>Salary Sheets</span>
            </button>
          )}

           {/* Leaderboard - Available to everyone or just admin/managers? Usually useful for everyone for motivation */}
           <button onClick={() => setCurrentView(View.LEADERBOARD)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentView === View.LEADERBOARD ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <Trophy size={20} /> <span>Top Performers</span>
           </button>

          <button onClick={() => setCurrentView(View.REPORT)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentView === View.REPORT ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <FileText size={20} /> <span>Account Report</span>
          </button>

          <button onClick={() => setCurrentView(View.CENTER_CALC)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentView === View.CENTER_CALC ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Calculator size={20} /> <span>Center Calculator</span>
          </button>
          
          <button onClick={() => setCurrentView(View.CENTER_REPORT)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentView === View.CENTER_REPORT ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <PieChart size={20} /> <span>Center Report</span>
          </button>

          <div className="pt-4 mt-2 border-t border-slate-800">
            <div className="text-xs font-semibold text-slate-500 uppercase px-4 py-2">Management</div>
            
            {/* Normal User CANNOT Add Employees */}
            {!isNormalUser && (
                <button onClick={() => setCurrentView(View.ADD_EMPLOYEE)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentView === View.ADD_EMPLOYEE ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <UserPlus size={20} /> <span>Add Employee</span>
                </button>
            )}

            {/* Everyone can Add Accounts (Subject to restrictions) */}
            <button onClick={() => setCurrentView(View.ADD_ACCOUNT)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentView === View.ADD_ACCOUNT ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <FilePlus size={20} /> <span>Add Account</span>
            </button>

            {/* Admin Only Views */}
            {isSuperAdmin && (
              <>
                <button onClick={() => setCurrentView(View.MANAGE_BRANCHES)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentView === View.MANAGE_BRANCHES ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                  <Building size={20} /> <span>Branches</span>
                </button>
                <button onClick={() => setCurrentView(View.MANAGE_USERS)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentView === View.MANAGE_USERS ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                  <Users size={20} /> <span>System Users</span>
                </button>
                <button onClick={() => setCurrentView(View.MANAGE_CENTERS)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentView === View.MANAGE_CENTERS ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                  <MapPin size={20} /> <span>Center Mgmt</span>
                </button>
                <button onClick={() => setCurrentView(View.MANAGE_COMMISSIONS)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentView === View.MANAGE_COMMISSIONS ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                  <Percent size={20} /> <span>Commission Setup</span>
                </button>
              </>
            )}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4 mt-auto">
            <button onClick={handleLogout} className="w-full flex items-center space-x-2 px-4 py-2 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors text-sm font-medium">
              <LogOut size={16} /> <span>Sign Out</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-200 p-4 px-6 flex justify-between items-center shadow-sm no-print z-20">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            {currentView === View.DASHBOARD && t.dashboardTitle}
            {currentView === View.SHEET && 'Salary Sheet Generator'}
            {currentView === View.REPORT && (isNormalUser ? 'My Accounts Report' : 'Account Opening Report')}
            {currentView === View.CENTER_REPORT && 'Monthly Center Report'}
            {currentView === View.ADD_EMPLOYEE && 'Add New Employee'}
            {currentView === View.ADD_ACCOUNT && 'Add Account Opening'}
            {currentView === View.MANAGE_BRANCHES && 'Branch Management'}
            {currentView === View.MANAGE_USERS && 'User Management'}
            {currentView === View.MANAGE_CENTERS && 'Center Master List'}
            {currentView === View.CENTER_CALC && 'Center Quick Calculation'}
            {currentView === View.LEADERBOARD && 'Performance Leaderboard'}
            {currentView === View.MANAGE_COMMISSIONS && 'Commission Rates Setup'}
          </h2>
          
          <div className="flex items-center space-x-4">
             
             {/* Language Toggle */}
             <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 text-xs font-bold rounded ${language === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLanguage('bn')}
                  className={`px-2 py-1 text-xs font-bold rounded ${language === 'bn' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  বাংলা
                </button>
             </div>

             {/* Month Selector: Visible for Dash/Sheet/Report/Leaderboard */}
             {(currentView === View.SHEET || currentView === View.DASHBOARD || currentView === View.LEADERBOARD) && !isNormalUser && (
              <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-md border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase px-2">Month</span>
                <input 
                  type="month" 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
             )}
            
            {currentView === View.SHEET && (
              <>
                {/* Branch Selector: Visible for Admin, Hidden for Manager (Auto-selected) */}
                {isSuperAdmin ? (
                   <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                      className="border border-slate-300 rounded-md px-3 py-1.5 text-sm flex items-center space-x-2 hover:bg-slate-50 bg-white shadow-sm font-medium text-slate-700"
                    >
                      <Settings size={14} />
                      <span>{selectedBranchIds.length ? `${selectedBranchIds.length} Selected` : 'Select Branches'}</span>
                      <ChevronDown size={12} className={`transition-transform ${isBranchDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isBranchDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                        <div className="p-2 border-b border-slate-100 mb-2">
                          <p className="text-xs font-semibold text-slate-500 uppercase">Available Branches</p>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {branches.map(b => (
                            <label key={b.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded cursor-pointer transition-colors">
                              <input 
                                type="checkbox" 
                                checked={selectedBranchIds.includes(b.id)} 
                                onChange={() => toggleBranch(b.id)}
                                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300" 
                              />
                              <span className="text-sm text-slate-700">{b.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-md border border-blue-100">
                     <Building size={14} />
                     <span>{branches.find(b => b.id === user.branch_id)?.name || 'My Branch'}</span>
                  </div>
                )}

                <button 
                  onClick={handleGenerate}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm active:scale-95 flex items-center space-x-2"
                >
                   <span>Generate</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50 relative">
          
          {currentView === View.DASHBOARD && (
            <Dashboard 
              branches={visibleBranches} 
              employees={visibleEmployees}
              activeRows={gridRows} 
              accounts={visibleAccounts}
              month={selectedMonth}
              language={language}
            />
          )}

          {currentView === View.LEADERBOARD && (
            <Leaderboard 
               rows={gridRows}
               branches={visibleBranches}
               month={selectedMonth}
               accounts={visibleAccounts}
            />
          )}

          {currentView === View.REPORT && (
            <AccountReport 
              accounts={visibleAccounts} 
              employees={isNormalUser ? [] : visibleEmployees} // User doesn't need full employee list in report usually, but filtering is handled
              branches={visibleBranches} 
              onEdit={handleEditAccount}
              onDelete={handleDeleteAccount}
              userRole={user.role}
            />
          )}

          {currentView === View.CENTER_REPORT && (
            <CenterReport 
              records={centerRecords} 
              branches={visibleBranches}
              employees={visibleEmployees}
              centers={visibleCenters}
            />
          )}

          {currentView === View.ADD_EMPLOYEE && !isNormalUser && (
            <AddEmployeeForm 
              branches={visibleBranches} 
              existingEmployees={visibleEmployees}
              commissionRates={commissionRates}
              onSave={handleAddEmployee} 
              onBulkSave={handleBulkAddEmployees}
              onEdit={handleEditEmployee}
              onDelete={handleDeleteEmployee}
              userRole={user.role}
            />
          )}
          
          {currentView === View.ADD_ACCOUNT && (
            <AddAccountForm 
              employees={isNormalUser ? [] : visibleEmployees} 
              existingAccounts={accounts}
              onSave={handleAddAccount}
              onBulkSave={handleBulkAddAccounts}
              currentUser={user}
            />
          )}

          {currentView === View.CENTER_CALC && (
             <CenterCalculation 
                records={centerRecords} 
                onAddRecord={handleAddCenterRecord} 
                onEditRecord={handleEditCenterRecord}
                onDeleteRecord={handleDeleteCenterRecord}
                branches={visibleBranches}
                employees={visibleEmployees}
                currentUser={user}
                centers={visibleCenters}
             />
          )}

          {currentView === View.MANAGE_BRANCHES && isSuperAdmin && (
            <ManageBranches 
              branches={branches}
              onAdd={handleAddBranch}
              onEdit={handleEditBranch}
              onDelete={handleDeleteBranch}
              onBulkAdd={handleBulkAddBranches}
            />
          )}

          {currentView === View.MANAGE_USERS && isSuperAdmin && (
            <ManageUsers 
              users={users}
              branches={branches}
              employees={employees}
              onAddUser={handleAddUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {currentView === View.MANAGE_CENTERS && isSuperAdmin && (
            <ManageCenters 
              centers={centers}
              branches={branches}
              employees={employees}
              onAdd={handleAddCenter}
              onEdit={handleEditCenter}
              onDelete={handleDeleteCenter}
              onBulkAdd={handleBulkAddCenters}
            />
          )}

          {currentView === View.MANAGE_COMMISSIONS && isSuperAdmin && (
            <ManageCommissions 
              rates={commissionRates}
              onUpdateRates={setCommissionRates}
            />
          )}

          {currentView === View.SHEET && !isNormalUser && (
            <div className="h-full flex flex-col space-y-4">
              {isGenerated && (
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm no-print">
                   <div className="flex items-center space-x-4">
                      <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        {selectedMonth}
                      </span>
                      <span className="text-sm text-slate-500">
                        {gridRows.length} Employees
                      </span>
                   </div>
                   <div className="flex space-x-2">
                      <button onClick={handleSave} className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors shadow-sm font-medium">
                        <Save size={16} /> <span>Save Changes</span>
                      </button>
                      <button onClick={handleExportCSV} className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-white text-slate-700 border border-slate-300 rounded hover:bg-slate-50 transition-colors font-medium">
                        <FileSpreadsheet size={16} /> <span>Excel</span>
                      </button>
                      <button onClick={handlePrint} className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-white text-slate-700 border border-slate-300 rounded hover:bg-slate-50 transition-colors font-medium">
                        <Printer size={16} /> <span>Print</span>
                      </button>
                   </div>
                </div>
              )}

              <div className="flex-1 min-h-0">
                 {isGenerated ? (
                   <SalaryTable 
                     rows={gridRows}
                     accounts={visibleAccounts} 
                     commissionRates={commissionRates}
                     onUpdateRow={handleUpdateRow} 
                     onAccountScanned={handleAccountScanned} 
                     readOnly={isSheetReadOnly}
                     month={selectedMonth}
                   />
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                     <div className="bg-slate-50 p-4 rounded-full mb-4">
                        <Table size={48} className="text-slate-300" />
                     </div>
                     <p className="font-medium text-slate-600">No Sheet Generated</p>
                     <p className="text-sm">Select a month and click "Generate" to start.</p>
                   </div>
                 )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Print Only Header */}
      <div className="hidden print-only fixed top-0 left-0 w-full p-8 bg-white z-[9999]">
        <h1 className="text-3xl font-bold text-center text-slate-900 uppercase tracking-widest">Salary Sheet</h1>
        <div className="text-center text-sm text-slate-600 mt-2 font-medium">
           Period: {selectedMonth} | Branch: {isManager ? branches.find(b => b.id === user.branch_id)?.name : 'Multiple'}
        </div>
      </div>

    </div>
  );
};

export default App;
