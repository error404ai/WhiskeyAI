/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { DataTable, DataTableRef } from "@/components/Datatable/Datatable";
import { DataTableColumnHeader } from "@/components/Datatable/DatatableColumnHeader";
import { ActionButtons, ActionItem } from "@/components/ui/action-buttons";
import { Button } from "@/components/ui/button";
import { DateTime } from "@/components/ui/datetime";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ActiveBadge, BlockedBadge } from "@/components/ui/status-badge";
import { Role } from "@/db/schema";
import * as UserManagementController from "@/server/controllers/admin/UserManagementController";
import { ColumnDef } from "@tanstack/react-table";
import { KeyIcon, ShieldIcon, Star, Trash2, UserCheck, UserIcon, UserX } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

type User = {
  id: number;
  customer_id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  is_active: boolean;
  has_unlimited_access: boolean;
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

  const handleEnableUnlimitedAccess = async (userId: number) => {
    const result = await UserManagementController.enableUnlimitedAccess(userId);
    if (result.success) {
      toast.success(result.message);
      refreshTable();
    } else {
      toast.error(result.message);
    }
  };

  const handleDisableUnlimitedAccess = async (userId: number) => {
    const result = await UserManagementController.disableUnlimitedAccess(userId);
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

  const columns: ColumnDef<{
    users: User;
    roles: Role;
  }>[] = [
    {
      accessorKey: "users.id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
      enableSorting: false,
    },
    {
      accessorKey: "users.customer_id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer ID" />,
      enableSorting: false,
    },
    {
      accessorKey: "users.publicKey",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Public Key" />,
      enableSorting: false,
    },
    {
      accessorKey: "roles.name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="User Type" />,
      enableSorting: false,
      cell: ({ row }) => {
        const roleName = row.original.roles?.name?.toLowerCase() || "default";
        const roleStyles: {
          [key: string]: { bg: string; text: string; icon: string };
        } = {
          admin: { bg: "bg-green-100", text: "text-green-800", icon: "shield" },
          user: { bg: "bg-blue-100", text: "text-blue-800", icon: "user" },
          editor: { bg: "bg-purple-100", text: "text-purple-800", icon: "edit" },
          viewer: { bg: "bg-gray-100", text: "text-gray-800", icon: "eye" },
          default: { bg: "bg-slate-100", text: "text-slate-800", icon: "circle" },
        };

        const style = roleStyles[roleName] || roleStyles.default;

        const Icon = () => {
          switch (style.icon) {
            case "shield":
              return <ShieldIcon className="h-4 w-4" />;
            case "user":
              return <UserIcon className="h-4 w-4" />;

            default:
              return <UserIcon className="h-4 w-4" />;
          }
        };

        return (
          <div className="flex items-center">
            <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${style.bg}`}>
              <Icon />
              <span className={`text-sm font-medium ${style.text}`}>{roleName.charAt(0).toUpperCase() + roleName.slice(1)}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "users.is_active",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const isActive = row.original.users.is_active !== false; // Default to true if undefined
        return isActive ? <ActiveBadge /> : <BlockedBadge />;
      },
      enableSorting: false,
    },
    {
      accessorKey: "users.has_unlimited_access",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Unlimited Access" />,
      cell: ({ row }) => {
        const hasUnlimitedAccess = row.original.users.has_unlimited_access === true;
        return (
          <div className="flex items-center">
            {hasUnlimitedAccess ? (
              <div className="flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-amber-800">
                <Star className="h-4 w-4" />
                <span className="text-sm font-medium">Unlimited</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-gray-800">
                <KeyIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Standard</span>
              </div>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "users.created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Registered On" />,
      cell: ({ row }) => {
        const date = row.original.users.created_at;
        <DateTime date={date} />;
      },
      enableSorting: false,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const original = row.original;
        const isActive = original.users.is_active !== false; // Default to true if undefined
        const hasUnlimitedAccess = original.users.has_unlimited_access === true;

        const actions: ActionItem[] = [
          {
            label: isActive ? "Block User" : "Unblock User",
            onClick: () => (isActive ? handleBlockUser(original.users.id) : handleUnblockUser(original.users.id)),
            icon: isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />,
            variant: isActive ? "destructive" : "default",
          },
          {
            label: hasUnlimitedAccess ? "Disable Unlimited Access" : "Enable Unlimited Access",
            onClick: () => (hasUnlimitedAccess ? handleDisableUnlimitedAccess(original.users.id) : handleEnableUnlimitedAccess(original.users.id)),
            icon: <Star className="h-4 w-4" />,
            variant: hasUnlimitedAccess ? "default" : "secondary",
          },
          {
            label: "Delete Permanently",
            onClick: () => confirmDelete(original.users),
            icon: <Trash2 className="h-4 w-4" />,
            variant: "destructive",
          },
        ];

        return <ActionButtons actions={actions} label="User Actions" />;
      },
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">Manage user accounts, permissions and status.</p>
      </div>

      <DataTable ref={tableRef} columns={columns} serverAction={UserManagementController.getAllUsers as any} queryKey="adminUsersList" searchAble={true} />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>Are you sure you want to delete the user {selectedUser?.name || selectedUser?.email || selectedUser?.customer_id}? This action cannot be undone and all user data will be permanently removed.</DialogDescription>
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
