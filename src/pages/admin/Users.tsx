import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Loader2, User, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export default function AdminUsers() {
  const [search, setSearch] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Get roles for all users
      const userIds = profiles.map(p => p.user_id);
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      // Merge roles with profiles
      return profiles.map(profile => ({
        ...profile,
        role: roles?.find(r => r.user_id === profile.user_id)?.role || 'user',
      }));
    },
  });

  const { data: orderCounts } = useQuery({
    queryKey: ['admin-user-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('user_id');
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach(order => {
        if (order.user_id) {
          counts[order.user_id] = (counts[order.user_id] || 0) + 1;
        }
      });
      return counts;
    },
  });

  const filteredUsers = users?.filter(user => 
    user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    user.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Quản lý người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên hoặc SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead className="text-center">Đơn hàng</TableHead>
                    <TableHead>Ngày tham gia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback>
                              {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.full_name || 'Chưa cập nhật'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>
                        {user.role === 'admin' ? (
                          <Badge variant="default" className="gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <User className="h-3 w-3" />
                            User
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {orderCounts?.[user.user_id] || 0}
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                    </TableRow>
                  ))}
                  {(!filteredUsers || filteredUsers.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Không có người dùng nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
