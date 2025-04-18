/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { DataTable, DataTableRef } from "@/components/Datatable/Datatable";
import { DataTableColumnHeader } from "@/components/Datatable/DatatableColumnHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { ColumnDef } from "@tanstack/react-table";
import { useRef, useState } from "react";
import * as UserManagementController from "@/server/controllers/admin/UserManagementController";
import { MoreHorizontal, UserX, UserCheck, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type User = {
  id: number;
  customer_id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

const UserManagementPage = () => {
  const tableRef = useRef<DataTableRef>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const refreshTable = () => {
    if (tableRef.current) {
      tableRef.current.refetch();
    }
  };

  const handleBlockUser = async (userId: number) => {
    const result = await UserManagementController.blockUser(userId);
    if (result.success) {
      toast.success(result.message);
      refreshTable();
    } else {
      toast.error(result.message);
    }
  };

  const handleUnblockUser = async (userId: number) => {
    const result = await UserManagementController.unblockUser(userId);
    if (result.success) {
      toast.success(result.message);
      refreshTable();
    } else {
      toast.error(result.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    const result = await UserManagementController.deleteUser(selectedUser.id);
    setShowDeleteDialog(false);
    
    if (result.success) {
      toast.success(result.message);
      refreshTable();
    } else {
      toast.error(result.message);
    }
  };

  const confirmDelete = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
      enableSorting: true,
    },
    {
      accessorKey: "customer_id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer ID" />,
      enableSorting: true,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <span>{row.original.name || "N/A"}</span>,
      enableSorting: true,
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => <span>{row.original.email || "N/A"}</span>,
      enableSorting: true,
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const isActive = row.original.is_active !== false; // Default to true if undefined
        return (
          <Badge variant={isActive ? "success" : "destructive"}>
            {isActive ? "Active" : "Blocked"}
          </Badge>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Registered On" />,
      cell: ({ row }) => {
        const date = row.original.created_at;
        try {
          return format(new Date(date), "PPP");
        } catch {
          return date || "N/A";
        }
      },
      enableSorting: true,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        const isActive = user.is_active !== false; // Default to true if undefined
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isActive ? (
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => handleBlockUser(user.id)}
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Block User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem 
                  onClick={() => handleUnblockUser(user.id)}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Unblock User
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                className="text-destructive" 
                onClick={() => confirmDelete(user)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Permanently
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div >
      <div className="mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">Manage user accounts, permissions and status.</p>
      </div>

 
        <DataTable 
          ref={tableRef}
          columns={columns} 
          serverAction={UserManagementController.getAllUsers as any}
          queryKey="adminUsersList"
          searchAble={false}
        />
    

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the user {selectedUser?.name || selectedUser?.email || selectedUser?.customer_id}? 
              This action cannot be undone and all user data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPage;
