/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { DataTable, DataTableRef } from "@/components/Datatable/Datatable";
import { DataTableColumnHeader } from "@/components/Datatable/DatatableColumnHeader";
import { ActionButtons, ActionItem } from "@/components/ui/action-buttons";
import { Button } from "@/components/ui/button";
import { DateTime } from "@/components/ui/datetime";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActiveBadge, BlockedBadge } from "@/components/ui/status-badge";
import * as UserManagementController from "@/server/controllers/admin/UserManagementController";
import { Role, UserType } from "@/server/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import { KeyIcon, Settings, ShieldIcon, Star, Trash2, UserCheck, UserIcon, UserX } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const UserManagementPage = () => {
  const tableRef = useRef<DataTableRef>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMaxAgentsDialog, setShowMaxAgentsDialog] = useState(false);
  const [maxAgentsValue, setMaxAgentsValue] = useState<number>(5);

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

  const confirmDelete = (user: UserType) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const openMaxAgentsDialog = (user: UserType) => {
    setSelectedUser(user);
    setMaxAgentsValue(user.max_agents || 5);
    setShowMaxAgentsDialog(true);
  };

  const handleUpdateMaxAgents = async () => {
    if (!selectedUser) return;
    
    if (maxAgentsValue < 1 || maxAgentsValue > 100) {
      toast.error("Max agents must be between 1 and 100");
      return;
    }

    const result = await UserManagementController.updateUserMaxAgents(selectedUser.id, maxAgentsValue);
    setShowMaxAgentsDialog(false);

    if (result.success) {
      toast.success(result.message);
      refreshTable();
    } else {
      toast.error(result.message);
    }
  };

  const columns: ColumnDef<{
    users: UserType;
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
      header: ({ column }) => <DataTableColumnHeader column={column} title="Access Type" />,
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
      accessorKey: "users.max_agents",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Max Agents" />,
      cell: ({ row }) => {
        const maxAgents = row.original.users.max_agents || 5;
        const hasUnlimitedAccess = row.original.users.has_unlimited_access === true;
        
        return (
          <div className="flex items-center">
            <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${hasUnlimitedAccess ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
              <span className="font-medium">{hasUnlimitedAccess ? "∞" : maxAgents}</span>
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "users.created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Registered On" />,
      cell: ({ row }) => {
        const date = row.original.users.createdAt;
        return <DateTime date={date} />;
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
            label: "Set Max Agents",
            onClick: () => openMaxAgentsDialog(original.users),
            icon: <Settings className="h-4 w-4" />,
            variant: "outline",
          },
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

      <Dialog open={showMaxAgentsDialog} onOpenChange={setShowMaxAgentsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Maximum Agents</DialogTitle>
            <DialogDescription>
              Set the maximum number of agents this user can create. This will override the default system limit.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="maxAgents">Maximum Agents</Label>
              <Input
                id="maxAgents"
                type="number"
                min="1"
                max="100"
                value={maxAgentsValue}
                onChange={(e) => setMaxAgentsValue(parseInt(e.target.value, 10))}
              />
              <p className="text-muted-foreground text-sm">
                Value must be between 1 and 100. User with unlimited access can always create more agents regardless of this setting.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMaxAgentsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMaxAgents}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPage;
