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
  { name: "Aditi Sharma", email: "aditi.sharma@email.com", plan: "Sangam", status: "Active" },
  { name: "Arjun Mehta", email: "arjun.mehta@email.com", plan: "Essence", status: "Active" },
  { name: "Priya Nair", email: "priya.nair@email.com", plan: "Free", status: "Active" },
  { name: "Kabir Iyer", email: "kabir.iyer@email.com", plan: "Sangam", status: "Active" },
  { name: "Meera Joshi", email: "meera.joshi@email.com", plan: "Essence", status: "Active" },
  { name: "Rohan Desai", email: "rohan.desai@email.com", plan: "Sangam", status: "Active" },
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
