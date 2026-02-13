'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { getTTRs } from '../apis/actions';

interface TTR {
  _id: string;
  title: string;
  date: string;
  createdAt: string;
}

const TTRBank = () => {
  const [ttrs, setTtrs] = useState<TTR[]>([]);
  const [filteredTtrs, setFilteredTtrs] = useState<TTR[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTTRs = async () => {
      const result = await getTTRs();
      if (result.success) {
        setTtrs(result.ttrs);
        setFilteredTtrs(result.ttrs);
      }
      setLoading(false);
    };
    fetchTTRs();
  }, []);

  useEffect(() => {
    const filtered = ttrs.filter((ttr) =>
      ttr.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTtrs(filtered);
  }, [searchTerm, ttrs]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      {/* Header with back button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-0">
        <Link href="/htbasas">
          <button className="p-1 sm:p-2 hover:bg-accent rounded-lg transition flex items-center gap-2">
            <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
            <span className="text-base sm:text-lg font-semibold text-foreground">Back</span>
          </button>
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">TTR Bank</h1>
        <div className="w-0 sm:w-10" />
      </div>

      {/* Search Bar */}
      <div className="mb-6 sm:mb-8">
        <Input
          placeholder="Search TTRs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm sm:text-base"
        />
      </div>

      {/* TTRs List */}
      <div className="space-y-2 sm:space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground text-sm sm:text-base">Loading...</p>
        ) : filteredTtrs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm sm:text-base">
            {ttrs.length === 0 ? 'No TTRs found' : 'No TTRs match your search'}
          </p>
        ) : (
          filteredTtrs.map((ttr) => (
            <div
              key={ttr._id}
              className="flex items-start gap-2 sm:gap-3 p-2 sm:p-4 bg-muted rounded-lg hover:bg-accent transition"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base text-foreground break-words">{ttr.title}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{formatDate(ttr.date)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TTRBank;
