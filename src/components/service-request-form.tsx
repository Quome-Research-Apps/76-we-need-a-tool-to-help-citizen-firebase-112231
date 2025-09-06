"use client"

import { useEffect, useState, useTransition } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Wand2, Loader2 } from 'lucide-react';

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { categorizeServiceRequest } from '@/ai/flows/categorize-service-request';

const formSchema = z.object({
  description: z.string().min(10, {
    message: "Please provide a detailed description (at least 10 characters).",
  }),
  category: z.string().min(2, {
    message: "Category is required.",
  }),
  referenceNumber: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ServiceRequestFormProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (data: FormValues) => void;
}

export function ServiceRequestForm({ isOpen, onOpenChange, onSave }: ServiceRequestFormProps) {
  const [isCategorizing, startCategorizing] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      category: "",
      referenceNumber: "",
    },
  });

  const description = form.watch('description');

  useEffect(() => {
    if (description.length > 15) {
      const handler = setTimeout(() => {
        startCategorizing(async () => {
          try {
            const result = await categorizeServiceRequest({ description });
            if (result.category) {
              form.setValue('category', result.category, { shouldValidate: true });
            }
          } catch (error) {
            console.error("AI categorization failed:", error);
          }
        });
      }, 1000);

      return () => clearTimeout(handler);
    }
  }, [description, form]);

  const onSubmit = (data: FormValues) => {
    onSave(data);
    form.reset();
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Log New Service Request</DialogTitle>
          <DialogDescription>
            Enter the details of the request you submitted to the city.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., 'Large pothole on the corner of Main St and 1st Ave.'" {...field} rows={4} />
                  </FormControl>
                  <FormDescription>
                    Describe the issue you reported.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                   <div className="relative">
                    <FormControl>
                      <Input placeholder="e.g., 'Pothole Repair'" {...field} />
                    </FormControl>
                     <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {isCategorizing ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                          <Wand2 className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <FormDescription>
                    AI will suggest a category as you type the description.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 'SR-12345'" {...field} />
                  </FormControl>
                  <FormDescription>
                    The ticket or reference number provided by the city.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isCategorizing}>
                {isCategorizing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Request
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
