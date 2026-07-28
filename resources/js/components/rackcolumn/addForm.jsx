import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AddRackColumnForm({
  form,
  onChange,
  onRowChange,
  onSubmit,
  isSubmitting,
  onCancel,
  errors,
  requestError,
  rows = [],
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Rack Column</CardTitle>
      </CardHeader>
      <CardContent>
        {requestError && (
          <p className="mb-4 text-sm text-destructive">{requestError}</p>
        )}
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="row_id">Rack Row</Label>
            <Select value={form.row_id} onValueChange={onRowChange} disabled={rows.length === 0}>
              <SelectTrigger id="row_id" className="w-full">
                <SelectValue placeholder="Select a rack row" />
              </SelectTrigger>
              <SelectContent>
                {rows.map((row) => (
                  <SelectItem key={row.id} value={String(row.id)}>
                    {row.row_number}{row.code ? ` - ${row.code}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {rows.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Add a rack row first before creating columns.
              </p>
            )}
            {errors.row_id && (
              <p className="text-sm text-destructive">{errors.row_id[0]}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="column_number">Column Number</Label>
            <Input
              id="column_number"
              name="column_number"
              value={form.column_number}
              onChange={onChange}
              placeholder="e.g. 1, A, C1"
            />
            {errors.column_number && (
              <p className="text-sm text-destructive">{errors.column_number[0]}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              name="code"
              value={form.code}
              onChange={onChange}
              placeholder="Auto-generated: rackname-rownumber-columnnumber"
              disabled
            />
            <p className="text-xs text-muted-foreground">Automatically generated from rack name, row number, and column number.</p>
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code[0]}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting || rows.length === 0}>
              {isSubmitting ? 'Saving...' : 'Save Column'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

