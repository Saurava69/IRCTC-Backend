import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { trainApi } from '@/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Train, Clock, MapPin, ArrowRight, Loader2 } from 'lucide-react';

const coachStyles = {
  FIRST_AC: 'bg-amber-50 border-amber-200 text-amber-800',
  SECOND_AC: 'bg-sky-50 border-sky-200 text-sky-800',
  THIRD_AC: 'bg-teal-50 border-teal-200 text-teal-800',
  SLEEPER: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  GENERAL: 'bg-slate-50 border-slate-200 text-slate-800',
};

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');

  useEffect(() => {
    if (!from || !to || !date) return;
    setLoading(true);
    trainApi.search(from, to, date)
      .then(({ data }) => setResults(data || []))
      .catch((err) => setError(err.response?.data?.message || 'Search failed'))
      .finally(() => setLoading(false));
  }, [from, to, date]);

  const handleBook = (result, coachType, fromStationId, toStationId) => {
    navigate('/book', {
      state: {
        trainRunId: result.trainRunId,
        coachType,
        fromStationId,
        toStationId,
        trainName: result.trainName,
        trainNumber: result.trainNumber,
        departureTime: result.departureTime,
        arrivalTime: result.arrivalTime,
        date: result.runDate,
        fromStation: result.fromStation,
        toStation: result.toStation,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <Loader2 className="relative h-10 w-10 animate-spin text-primary" />
        </div>
        <span className="mt-4 text-muted-foreground text-sm tracking-wide">Searching trains...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-32 animate-fade-up">
        <p className="text-destructive text-lg font-medium">{error}</p>
        <Button variant="outline" className="mt-6 border-border/50 hover:border-primary/50" onClick={() => navigate('/')}>
          Back to Search
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Route Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="font-[var(--font-display)] text-3xl text-foreground flex items-center gap-3">
          <span>{from}</span>
          <ArrowRight className="h-5 w-5 text-primary" />
          <span>{to}</span>
        </h1>
        <div className="flex gap-2">
          <Badge className="bg-secondary border border-border/50 text-muted-foreground font-mono text-xs">{date}</Badge>
          <Badge className="bg-primary/10 border border-primary/20 text-primary text-xs">
            {results.length} train{results.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      <div className="track-line opacity-30" />

      {results.length === 0 ? (
        <Card className="text-center p-16 bg-card border-border animate-fade-up delay-100">
          <Train className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="font-[var(--font-display)] text-xl text-foreground">No trains found</p>
          <p className="text-muted-foreground mt-2 text-sm">Try different stations or travel dates</p>
          <Button className="mt-6 bg-primary text-primary-foreground" onClick={() => navigate('/')}>
            Search Again
          </Button>
        </Card>
      ) : (
        <div className="space-y-5">
          {results.map((result, idx) => (
            <Card
              key={result.trainRunId}
              className={`animate-fade-up bg-card border-border hover:border-primary/30 transition-all duration-300 overflow-hidden brass-shimmer`}
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <CardContent className="p-6">
                {/* Train header */}
                <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <Train className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-[var(--font-display)] text-lg text-foreground">{result.trainName}</h3>
                      <span className="text-xs font-mono text-muted-foreground tracking-wide">{result.trainNumber}</span>
                    </div>
                  </div>
                  <Badge className="bg-secondary border border-border/50 text-muted-foreground text-xs font-medium">
                    {result.trainType}
                  </Badge>
                </div>

                {/* Time display */}
                <div className="flex items-center gap-4 mb-6 p-4 rounded-lg bg-secondary/50 border border-border">
                  <div className="text-center min-w-[80px]">
                    <p className="text-2xl font-bold text-foreground font-mono tracking-tight">{result.departureTime || '--:--'}</p>
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-primary/60" />
                      {result.fromStation?.name || from}
                    </p>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 track-line" />
                    <span className="px-3 py-1 bg-card border border-border rounded-full text-xs text-muted-foreground flex items-center gap-1.5 whitespace-nowrap">
                      <Clock className="h-3 w-3 text-primary/60" />
                      {result.durationMinutes ? `${Math.floor(result.durationMinutes / 60)}h ${result.durationMinutes % 60}m` : '--'}
                    </span>
                    <div className="flex-1 track-line" />
                  </div>
                  <div className="text-center min-w-[80px]">
                    <p className="text-2xl font-bold text-foreground font-mono tracking-tight">{result.arrivalTime || '--:--'}</p>
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-primary/60" />
                      {result.toStation?.name || to}
                    </p>
                  </div>
                </div>

                {/* Coach availability */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(result.availability || [])
                    .filter((avail) => avail.availableSeats > 0 || avail.racSeats > 0 || avail.waitlistCount > 0)
                    .map((avail) => {
                    const fare = result.fares?.find((f) => f.coachType === avail.coachType);
                    const style = coachStyles[avail.coachType] || 'bg-muted/50 border-border/30 text-muted-foreground';
                    return (
                      <div key={avail.coachType} className={`rounded-lg p-4 border ${style}`}>
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-xs uppercase tracking-wider">{avail.coachType.replace('_', ' ')}</span>
                          {fare && <span className="font-bold text-foreground">₹{fare.baseFare}</span>}
                        </div>
                        <div className="text-xs space-y-1 mb-3 text-muted-foreground">
                          {avail.availableSeats > 0 && (
                            <div className="flex justify-between">
                              <span>Available</span>
                              <span className="font-semibold text-emerald-600">{avail.availableSeats}</span>
                            </div>
                          )}
                          {avail.racSeats > 0 && (
                            <div className="flex justify-between">
                              <span>RAC</span>
                              <span className="font-semibold text-amber-600">{avail.racSeats}</span>
                            </div>
                          )}
                          {avail.waitlistCount > 0 && (
                            <div className="flex justify-between">
                              <span>Waitlist</span>
                              <span className="font-semibold text-red-600">{avail.waitlistCount}</span>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="w-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 text-xs font-medium"
                          onClick={() => handleBook(result, avail.coachType, result.fromStation?.id, result.toStation?.id)}
                        >
                          {avail.availableSeats > 0 ? 'Book Now' : avail.racSeats > 0 ? 'Book RAC' : 'Join Waitlist'}
                        </Button>
                      </div>
                    );
                  })}
                  {(result.availability || []).filter((avail) => avail.availableSeats > 0 || avail.racSeats > 0 || avail.waitlistCount > 0).length === 0 && (
                    <div className="col-span-full text-center py-6 text-muted-foreground text-sm">
                      No seats available for this train
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
