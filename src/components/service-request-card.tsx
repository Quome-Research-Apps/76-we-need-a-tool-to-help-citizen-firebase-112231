"use client"

import * as React from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, PenLine, Plus } from 'lucide-react';

import type { ServiceRequest, Status, StatusUpdate } from '@/types';
import { StatusEnum } from '@/types';
import { getCategoryIcon } from '@/components/category-icon';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from '@/lib/utils';


const statusUpdateSchema = z.object({
  status: z.enum(StatusEnum),
  notes: z.string().min(1, "Notes are required."),
});

type StatusUpdateFormValues = z.infer<typeof statusUpdateSchema>;

interface ServiceRequestCardProps {
  request: ServiceRequest;
  onUpdate: (request: ServiceRequest) => void;
}

const statusColors: Record<Status, string> = {
  Submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "In Progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};


export function ServiceRequestCard({ request, onUpdate }: ServiceRequestCardProps) {
  const [isUpdateFormOpen, setIsUpdateFormOpen] = React.useState(false);
  const form = useForm<StatusUpdateFormValues>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: request.currentStatus,
      notes: "",
    },
  });

  const onSubmit = (data: StatusUpdateFormValues) => {
    const newUpdate: StatusUpdate = {
      id: crypto.randomUUID(),
      status: data.status,
      notes: data.notes,
      date: new Date().toISOString(),
    };
    
    const updatedRequest: ServiceRequest = {
      ...request,
      currentStatus: newUpdate.status,
      updates: [newUpdate, ...request.updates],
    };

    onUpdate(updatedRequest);
    form.reset({ status: newUpdate.status, notes: "" });
    setIsUpdateFormOpen(false);
  };
  
  const Icon = getCategoryIcon(request.category, { className: "h-6 w-6 text-primary" });

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          {Icon}
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-lg mb-1">{request.category}</CardTitle>
            <Badge variant="outline" className={cn("border-2", statusColors[request.currentStatus])}>{request.currentStatus}</Badge>
          </div>
          <CardDescription className="line-clamp-2">{request.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row text-sm text-muted-foreground gap-2 sm:gap-6">
            <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Opened: {new Date(request.createdAt).toLocaleDateString()}</span>
            </div>
            {request.referenceNumber && (
            <div className="flex items-center gap-2">
                <PenLine className="h-4 w-4" />
                <span>Ref: {request.referenceNumber}</span>
            </div>
            )}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              View {request.updates.length} Update(s)
            </AccordionTrigger>
            <AccordionContent>
                <div className="space-y-4 pr-4 max-h-60 overflow-y-auto">
                {request.updates.map((update) => (
                    <div key={update.id} className="grid grid-cols-[auto,1fr] gap-x-3 text-sm">
                      <div className="flex flex-col items-center">
                        <div className={cn("w-4 h-4 rounded-full border-2", statusColors[update.status])} />
                        <div className="w-px h-full bg-border" />
                      </div>
                      <div>
                        <p className="font-semibold">{update.status}</p>
                        <p className="text-muted-foreground">{update.notes}</p>
                        <p className="text-xs text-muted-foreground/80 mt-1">{new Date(update.date).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <Dialog open={isUpdateFormOpen} onOpenChange={setIsUpdateFormOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Status Update
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Request Status</DialogTitle>
              <DialogDescription>Add a new status and notes for this service request.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a new status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {StatusEnum.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., 'Received an email confirmation from the city.'" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Save Update</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
