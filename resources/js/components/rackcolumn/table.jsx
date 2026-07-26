import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function RackColumnTable({
  data = [],
  isLoading,
  onAdd,
  onEdit,
  onRequestDelete,
}) {
  const [search, setSearch] = useState('');
  const filtered = data.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.row?.row_number?.toLowerCase().includes(q) ||
      c.column_number?.toLowerCase().includes(q) ||
      c.code?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="flex items-center gap-3 justify-between">
        <div className="relative min-w-0 flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            placeholder="Search columns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9"
          />
        </div>
        <Button className="shrink-0 gap-2" onClick={onAdd}>
          <Plus />
          Add Column
        </Button>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">SL No</TableHead>
              <TableHead>Row Number</TableHead>
              <TableHead>Column Number</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan="5"
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan="5"
                  className="text-center py-8 text-muted-foreground"
                >
                  {search ? 'No columns match your search.' : 'No columns found.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((col, index) => (
                <TableRow key={col.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{col.row?.row_number || '-'}</TableCell>
                  <TableCell>{col.column_number}</TableCell>
                  <TableCell>{col.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(col.id)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRequestDelete(col.id)}
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}

