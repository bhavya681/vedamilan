import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const users = [
  { name: "Aryan Mehta", email: "aryan@example.com", plan: "Free", status: "Active" },
  { name: "Ananya Sharma", email: "ananya@example.com", plan: "Sangam", status: "Active" },
  { name: "Kabir Singh", email: "kabir@example.com", plan: "Essence", status: "Suspended" },
];

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Users</h1>
      <Card>
        <CardHeader>
          <CardTitle>Member directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.email}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.plan}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "Active" ? "secondary" : "destructive"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
