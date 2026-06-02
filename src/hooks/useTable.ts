import { useState, useMemo, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface UseTableOptions<T> {
  initialData: T[];
  searchFields: (keyof T)[];
  defaultPageSize?: number;
  supabaseTable?: string;
  supabaseFilter?: { column: string; value: any };
}

const tableColumns: Record<string, string[]> = {
  clients: ["id", "name", "service_type", "department", "payment_amount", "payment_status", "meta_data", "created_at"],
  tasks: ["id", "title", "department", "assigned_to", "due_date", "priority", "status", "progress", "client_id", "meta_data", "created_at"],
  goals: ["id", "description", "department", "target", "current_progress", "pct_achieved", "deadline", "status", "meta_data", "created_at"],
  taxation_returns: ["id", "client_name", "tax_type", "period_or_year", "status", "filed_on", "remarks", "meta_data", "created_at"],
  litigation_cases: ["id", "name", "case_type", "status", "amount", "received", "next_hearing", "created_at"],
  law_hearings: ["id", "date", "time", "case_name", "court", "priority", "created_at"],
  reports: ["id", "name", "category", "period", "prepared_by", "status", "meta_data", "created_at"],
  reminders: ["id", "title", "service", "client_name", "due_date", "priority", "status", "created_at"],
  settings_users: ["id", "name", "role", "access", "status", "created_at"],
  fds_history: ["id", "date", "income", "currency", "allocations", "created_at"]
};

// Helper: Serialize frontend object to database row
const serializeRow = (item: any, table: string, filter?: { column: string; value: any }) => {
  const serialized: any = {};
  const meta: any = {};

  if (item.id) {
    serialized.id = item.id;
  }

  if (filter) {
    serialized[filter.column] = filter.value;
  }

  Object.entries(item).forEach(([key, val]) => {
    if (key === "id") return;

    let dbKey = key;
    let isMapped = false;

    // Apply translations
    if (key === "serviceType") {
      dbKey = "service_type";
      isMapped = true;
    } else if (key === "paymentAmount" || (key === "amount" && table === "clients")) {
      dbKey = "payment_amount";
      isMapped = true;
    } else if (key === "paymentStatus" || (key === "status" && table === "clients")) {
      dbKey = "payment_status";
      isMapped = true;
    } else if (key === "assignedTo" || key === "assignee") {
      dbKey = "assigned_to";
      isMapped = true;
    } else if (key === "dueDate") {
      dbKey = "due_date";
      isMapped = true;
    } else if (key === "currentProgress" || key === "progress") {
      dbKey = "current_progress";
      isMapped = true;
    } else if (key === "pctAchieved" || key === "pct") {
      dbKey = "pct_achieved";
      isMapped = true;
    } else if (key === "targetDate" || key === "deadline") {
      dbKey = "deadline";
      isMapped = true;
    } else if (key === "clientName" || key === "client" || ((key === "name" || key === "companyName") && table === "taxation_returns")) {
      dbKey = "client_name";
      isMapped = true;
    } else if (key === "reportTitle" || key === "reportName" || (key === "name" && table === "reports")) {
      dbKey = "name";
      isMapped = true;
    } else if (key === "preparedBy" || key === "owner") {
      dbKey = "prepared_by";
      isMapped = true;
    } else if (key === "taxType") {
      dbKey = "tax_type";
      isMapped = true;
    } else if (key === "periodOrYear" || key === "year" || key === "period") {
      dbKey = "period_or_year";
      isMapped = true;
    } else if (key === "caseType") {
      dbKey = "case_type";
      isMapped = true;
    } else if (key === "nextHearing") {
      dbKey = "next_hearing";
      isMapped = true;
    } else if (key === "caseName") {
      dbKey = "case_name";
      isMapped = true;
    } else if (key === "filedOn") {
      dbKey = "filed_on";
      isMapped = true;
    }

    // Now check if dbKey is a valid root column for the target table
    const allowedColumns = tableColumns[table];
    if (allowedColumns) {
      if (allowedColumns.includes(dbKey)) {
        serialized[dbKey] = val;
      } else {
        // If not a root column, keep in meta_data
        meta[key] = val;
      }
    } else {
      // Legacy fallback
      if (
        isMapped ||
        [
          "name",
          "title",
          "description",
          "department",
          "priority",
          "status",
          "target",
          "court",
          "time",
          "date",
          "income",
          "currency",
          "allocations",
          "role",
          "access",
          "remarks",
          "amount",
          "received",
          "category",
        ].includes(key)
      ) {
        serialized[dbKey] = val;
      } else {
        meta[key] = val;
      }
    }
  });

  if (Object.keys(meta).length > 0) {
    serialized.meta_data = meta;
  }

  return serialized;
};

// Helper: Deserialize database row to frontend object
const deserializeRow = (row: any, table: string) => {
  const item: any = { id: row.id };

  Object.entries(row).forEach(([key, val]) => {
    if (key === "id" || key === "meta_data") return;

    if (key === "service_type") {
      item.serviceType = val;
    } else if (key === "payment_amount") {
      item.paymentAmount = val;
      if (table === "clients") {
        item.amount = val;
      }
    } else if (key === "payment_status") {
      item.paymentStatus = val;
      if (table === "clients") {
        item.status = val;
      }
    } else if (key === "assigned_to") {
      item.assignedTo = val;
      item.assignee = val;
    } else if (key === "due_date") {
      item.dueDate = val;
    } else if (key === "current_progress") {
      item.currentProgress = val;
      item.progress = val;
    } else if (key === "pct_achieved") {
      item.pctAchieved = val;
      item.pct = val;
    } else if (key === "deadline") {
      item.deadline = val;
      item.targetDate = val;
    } else if (key === "client_name") {
      item.clientName = val;
      item.client = val;
      item.name = val;
      item.companyName = val;
    } else if (key === "prepared_by") {
      item.preparedBy = val;
      item.owner = val;
    } else if (key === "tax_type") {
      item.taxType = val;
    } else if (key === "period_or_year") {
      item.periodOrYear = val;
      item.year = val;
      item.period = val;
    } else if (key === "case_type") {
      item.caseType = val;
    } else if (key === "next_hearing") {
      item.nextHearing = val;
    } else if (key === "case_name") {
      item.caseName = val;
    } else if (key === "filed_on") {
      item.filedOn = val;
    } else {
      item[key] = val;
    }
  });

  if (row.meta_data) {
    Object.entries(row.meta_data).forEach(([key, val]) => {
      item[key] = val;
    });
  }

  return item;
};

export function useTable<T extends { id: string | number }>({
  initialData,
  searchFields,
  defaultPageSize = 10,
  supabaseTable,
  supabaseFilter,
}: UseTableOptions<T>) {
  // Data State
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Dialog / Sidebar Drawer Trigger States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Selected item for CRUD actions
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({});

  // Fetch Data from Supabase
  const fetchData = async () => {
    if (!supabaseTable) return;
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from(supabaseTable).select("*");
      if (supabaseFilter) {
        query = query.eq(supabaseFilter.column, supabaseFilter.value);
      }
      const { data: dbData, error: dbError } = await query;
      if (dbError) throw dbError;

      const parsedData = (dbData || []).map((row) => deserializeRow(row, supabaseTable));
      setData(parsedData);
    } catch (err: any) {
      console.error(`Failed to fetch from ${supabaseTable}:`, err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [supabaseTable, JSON.stringify(supabaseFilter)]);

  // CRUD Operations
  const addItem = async (item: T) => {
    if (!supabaseTable) {
      setData((current) => [item, ...current]);
      return item;
    }
    try {
      const serialized = serializeRow(item, supabaseTable, supabaseFilter);
      // Omit temporary generated IDs to let Supabase create UUIDs
      const isTempId =
        !item.id ||
        String(item.id).match(/^\d+$/) ||
        String(item.id).startsWith("temp-") ||
        String(item.id).startsWith("fb-") ||
        String(item.id).startsWith("li-") ||
        String(item.id).startsWith("yt-") ||
        String(item.id).startsWith("pk-") ||
        String(item.id).startsWith("usr-") ||
        String(item.id).startsWith("rpt-") ||
        String(item.id).startsWith("rem-") ||
        String(item.id).startsWith("pay-") ||
        String(item.id).startsWith("sf-") ||
        String(item.id).startsWith("st-") ||
        String(item.id).startsWith("sl-") ||
        String(item.id).startsWith("cr-") ||
        String(item.id).startsWith("crt-") ||
        String(item.id).startsWith("us-") ||
        String(item.id).startsWith("de-");

      if (isTempId) {
        delete serialized.id;
      }

      const { data: dbData, error: dbError } = await supabase
        .from(supabaseTable)
        .insert(serialized)
        .select()
        .single();

      if (dbError) throw dbError;
      const deserialized = deserializeRow(dbData, supabaseTable);
      setData((current) => [deserialized, ...current]);
      return deserialized;
    } catch (err) {
      console.error(`Failed to insert into ${supabaseTable}:`, err);
      // Fallback
      setData((current) => [item, ...current]);
      throw err;
    }
  };

  const updateItem = async (updatedItem: T) => {
    if (!supabaseTable) {
      setData((current) =>
        current.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );
      return;
    }
    try {
      const serialized = serializeRow(updatedItem, supabaseTable, supabaseFilter);
      const { error: dbError } = await supabase
        .from(supabaseTable)
        .update(serialized)
        .eq("id", updatedItem.id);

      if (dbError) throw dbError;
      setData((current) =>
        current.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );
    } catch (err) {
      console.error(`Failed to update in ${supabaseTable}:`, err);
      // Fallback
      setData((current) =>
        current.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );
      throw err;
    }
  };

  const deleteItem = async (id: string | number) => {
    if (!supabaseTable) {
      setData((current) => current.filter((item) => item.id !== id));
      return;
    }
    try {
      const { error: dbError } = await supabase
        .from(supabaseTable)
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;
      setData((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      console.error(`Failed to delete in ${supabaseTable}:`, err);
      // Fallback
      setData((current) => current.filter((item) => item.id !== id));
      throw err;
    }
  };

  const selectItemForAction = (item: T, action: "view" | "edit" | "delete") => {
    setSelectedItem(item);
    if (action === "view") setIsViewOpen(true);
    if (action === "edit") setIsEditOpen(true);
    if (action === "delete") setIsConfirmOpen(true);
  };

  // Sorting State
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const toggleSort = (field: keyof T) => {
    if (sortField === field) {
      setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Search & Filter Processing
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // 1. Search Query Matching
      const matchesSearch =
        searchQuery.trim() === "" ||
        searchFields.some((field) => {
          const val = item[field];
          if (val === undefined || val === null) return false;
          return String(val).toLowerCase().includes(searchQuery.toLowerCase());
        });

      // 2. Additional Filters Matching
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value || value === "all" || value === "") return true;
        const val = item[key as keyof T];
        if (val === undefined || val === null) return false;
        return String(val).toLowerCase() === String(value).toLowerCase();
      });

      return matchesSearch && matchesFilters;
    });
  }, [data, searchQuery, filters, searchFields]);

  // Sorted Data
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      // Handle numerical/currency/percentage values sorting
      const cleanA = String(aVal).replace(/[^\d.-]/g, "");
      const cleanB = String(bVal).replace(/[^\d.-]/g, "");
      const aNum = Number(cleanA);
      const bNum = Number(cleanB);

      if (
        cleanA !== "" &&
        cleanB !== "" &&
        !isNaN(aNum) &&
        !isNaN(bNum) &&
        String(aVal).match(/[\d]/) &&
        String(bVal).match(/[\d]/)
      ) {
        return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
      }

      const comparison = String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
        sensitivity: "base",
      });
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortField, sortDirection]);

  // Paginated Data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;

  // Handle page out-of-bounds (e.g. after deletion)
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  return {
    // States & Setters
    data,
    setData,
    loading,
    error,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    isAddOpen,
    setIsAddOpen,
    isEditOpen,
    setIsEditOpen,
    isViewOpen,
    setIsViewOpen,
    isConfirmOpen,
    setIsConfirmOpen,
    selectedItem,
    setSelectedItem,
    visibleColumns,
    setVisibleColumns,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,

    // Computed Values
    filteredData,
    sortedData,
    paginatedData,
    totalPages,

    // CRUD functions
    addItem,
    updateItem,
    deleteItem,
    selectItemForAction,
    toggleSort,
    refetch: fetchData,
  };
}
