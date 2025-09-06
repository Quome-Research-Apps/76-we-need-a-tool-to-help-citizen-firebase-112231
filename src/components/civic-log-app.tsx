"use client";

import { useState, useMemo, useEffect } from 'react';
import { FileDown, ListFilter, PlusCircle, ArrowUpDown } from 'lucide-react';
import Image from 'next/image';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { ServiceRequest, Status } from '@/types';
import { ServiceRequestCard } from '@/components/service-request-card';
import { ServiceRequestForm } from '@/components/service-request-form';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

type SortKey = 'createdAt' | 'currentStatus';
type SortDirection = 'asc' | 'desc';

export default function CivicLogApp() {
  const [requests, setRequests] = useLocalStorage<ServiceRequest[]>('civiclog-requests', []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const addRequest = (request: Omit<ServiceRequest, 'id' | 'updates' | 'currentStatus' | 'createdAt'>) => {
    const newRequest: ServiceRequest = {
      ...request,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      currentStatus: 'Submitted',
      updates: [
        {
          id: crypto.randomUUID(),
          status: 'Submitted',
          date: new Date().toISOString(),
          notes: 'Request created.',
        },
      ],
    };
    setRequests(prev => [newRequest, ...prev]);
  };

  const updateRequest = (updatedRequest: ServiceRequest) => {
    setRequests(prev =>
      prev.map(req => (req.id === updatedRequest.id ? updatedRequest : req))
    );
  };

  const filteredAndSortedRequests = useMemo(() => {
    return requests
      .filter(req => statusFilter === 'All' || req.currentStatus === statusFilter)
      .sort((a, b) => {
        let compare = 0;
        if (sortKey === 'createdAt') {
          compare = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else {
          compare = a.currentStatus.localeCompare(b.currentStatus);
        }
        return sortDirection === 'desc' ? -compare : compare;
      });
  }, [requests, statusFilter, sortKey, sortDirection]);

  const exportData = () => {
    const dataStr = JSON.stringify(requests, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `civiclog_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  }

  if (!isMounted) {
    return (
       <div className="container mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen p-4 md:p-8 font-body">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary">CivicLog</h1>
          <p className="text-muted-foreground mt-1">Your personal logbook for civic actions.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Request
          </Button>
          <Button variant="outline" size="icon" onClick={exportData} disabled={requests.length === 0} aria-label="Export Data">
            <FileDown className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <ServiceRequestForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={addRequest}
      />
      
      {requests.length > 0 ? (
        <>
          <div className="flex items-center justify-between bg-card p-2 rounded-lg mb-6 border">
            <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ListFilter className="mr-2 h-4 w-4" />
                      Filter: {statusFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuRadioGroup value={statusFilter} onValueChange={(v) => setStatusFilter(v as Status | 'All')}>
                      <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioItem value="Submitted">Submitted</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="In Progress">In Progress</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="Completed">Completed</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="Rejected">Rejected</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      Sort by: {sortKey === 'createdAt' ? 'Date' : 'Status'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuRadioGroup value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                      <DropdownMenuRadioItem value="createdAt">Date</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="currentStatus">Status</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                 <Button variant="ghost" size="icon" onClick={toggleSortDirection} aria-label="Toggle Sort Direction">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}><path d="m3 16 4 4 4-4M7 20V4M21 8l-4-4-4 4M17 4v16"/></svg>
                </Button>
            </div>
          </div>
          <div className="grid gap-6">
            {filteredAndSortedRequests.map(request => (
              <ServiceRequestCard key={request.id} request={request} onUpdate={updateRequest} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20 px-6 bg-card rounded-lg border-2 border-dashed flex flex-col items-center">
            <Image 
                src="https://picsum.photos/800/400" 
                alt="Empty state illustration"
                width={400}
                height={200}
                data-ai-hint="city skyline"
                className="rounded-lg mb-6 opacity-70"
            />
          <h2 className="text-2xl font-semibold mb-2">Your Logbook is Empty</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Start tracking your communication with the city. Click below to add your first service request.
          </p>
          <Button onClick={() => setIsFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add First Request
          </Button>
        </div>
      )}
    </div>
  );
}
