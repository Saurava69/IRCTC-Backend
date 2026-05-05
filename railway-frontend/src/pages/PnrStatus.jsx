import { useState } from 'react';
import { pnrApi } from '@/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Loader2, AlertCircle, FileText } from 'lucide-react';

const statusStyles = {
  CONFIRMED: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  PAYMENT_PENDING: 'bg-amber-50 border-amber-200 text-amber-700',
  RAC: 'bg-sky-50 border-sky-200 text-sky-700',
  WAITLISTED: 'bg-orange-50 border-orange-200 text-orange-700',
  CANCELLED: 'bg-red-50 border-red-200 text-red-700',
  FAILED: 'bg-slate-50 border-slate-200 text-slate-700',
};

export default function PnrStatus() {
  const [pnr, setPnr] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!pnr.trim()) return;
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const { data } = await pnrApi.check(pnr.trim());
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'PNR not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-up">
      <div className="text-center">
        <h1 className="font-[var(--font-display)] text-4xl text-foreground mb-3">PNR Status</h1>
        <p className="text-muted-foreground text-sm">Enter your PNR number to check booking status</p>
      </div>

      <Card className="bg-card border-border shadow-lg overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <CardContent className="p-6">
          <form onSubmit={handleCheck} className="flex gap-3">
            <div className="relative flex-1 group">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60 group-focus-within:text-primary transition-colors" />
              <Input
                className="pl-10 h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:bg-secondary font-mono transition-all duration-200"
                placeholder="e.g. PNR2026042200001"
                value={pnr}
                onChange={(e) => setPnr(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              {loading ? '' : 'Check'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 animate-fade-up">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="bg-card border-border overflow-hidden animate-fade-up">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">PNR Number</p>
                <p className="font-mono text-lg text-foreground font-bold">{result.pnr}</p>
              </div>
              <Badge className={`${statusStyles[result.bookingStatus] || ''} border px-3 py-1`}>
                {result.bookingStatus}
              </Badge>
            </div>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Train', value: `${result.trainName || ''} (${result.trainNumber || ''})` },
                { label: 'Coach Type', value: result.coachType?.replace('_', ' ') },
                { label: 'From', value: `${result.fromStation || ''} (${result.fromStationCode || ''})` },
                { label: 'To', value: `${result.toStation || ''} (${result.toStationCode || ''})` },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
                  <p className="font-semibold text-foreground text-sm">{value}</p>
                </div>
              ))}
            </div>

            {result.passengers?.length > 0 && (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50 border-border hover:bg-secondary/50">
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Name</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Age</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Seat</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Coach</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">WL/RAC</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.passengers.map((p, i) => (
                      <TableRow key={i} className="border-border hover:bg-secondary/30">
                        <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                        <TableCell className="text-muted-foreground">{p.age}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${statusStyles[p.status] || ''} text-xs border`}>
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{p.seatNumber || '-'}</TableCell>
                        <TableCell className="font-mono text-sm">{p.coachNumber || '-'}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {p.waitlistNumber ? `WL ${p.waitlistNumber}` : p.racNumber ? `RAC ${p.racNumber}` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
