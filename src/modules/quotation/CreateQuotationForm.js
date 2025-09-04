
"use client";
import { addDays } from "date-fns";
import { useMemo, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { createQuotation } from "@/features/quotationSlice";
import { serviceProviderDetails } from "@/constants/constants";
import { toast } from "sonner";
import { useContactDetails } from "@/hooks/useContact";
import { fetchUserByEmail } from "@/features/shared/userSlice";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash } from "lucide-react";

// Sanitization utility for input fields to prevent XSS and HTML/script injection


const sanitizeInput = (input) => {
  if (typeof input !== "string") return "";

  const hasHTMLTags = /<[^>]+>/g.test(input);
  const hasScriptWord = /\bscript\b/i.test(input);

  return hasHTMLTags || hasScriptWord ? "" : input.trim();
};

// Currency formatting utility
const formatCurrency = (amount, currency) => {
  const symbols = { INR: "₹", USD: "$" };
  return `${symbols[currency] || currency} ${amount.toFixed(2)}`;
};

// Zod schema for validation
const itemSchema = z.object({
  serviceName: z
    .string()
    .min(1, "Service name is required")
    .transform(sanitizeInput)
    .refine((val) => val === sanitizeInput(val), {
      message: "Service name contains invalid characters or HTML",
    }),
  basePrice: z.coerce.number().gt(0, "Base price must be > 0").refine((val) => !isNaN(val), {
    message: "Base price must be a valid number",
  }),
  sellPrice: z.coerce.number().gt(0, "Sell price must be > 0").refine((val) => !isNaN(val), {
    message: "Sell price must be a valid number",
  }),
  currency: z.enum(["INR", "USD"]),
});

const quotationSchema = z.object({
  projectTitle: z
    .string()
    .min(1, "Project title is required")
    .transform(sanitizeInput)
    .refine((val) => val === sanitizeInput(val), {
      message: "Project title contains invalid characters or HTML",
    }),
  scopeOfWork: z
    .string()
    .min(1, "Scope of work is required")
    .transform(sanitizeInput)
    .refine((val) => val === sanitizeInput(val), {
      message: "Scope of work contains invalid characters or HTML",
    }),
  deliverables: z
    .string()
    .min(1, "Deliverables are required")
    .transform(sanitizeInput)
    .refine((val) => val === sanitizeInput(val), {
      message: "Deliverables contain invalid characters or HTML",
    }),
  timeline: z
    .string()
    .min(1, "Timeline is required")
    .transform(sanitizeInput)
    .refine((val) => val === sanitizeInput(val), {
      message: "Timeline contains invalid characters or HTML",
    }),
  items: z.array(itemSchema).min(1, "At least one item is required"),
  taxPercent: z.coerce.number().min(0, "Tax % cannot be negative").default(18).refine((val) => !isNaN(val), {
    message: "Tax percentage must be a valid number",
  }),
  currency: z.enum(["INR", "USD"]).default("INR"),
  paymentTerms: z
    .string()
    .min(1, "Payment terms are required")
    .transform(sanitizeInput)
    .refine((val) => val === sanitizeInput(val), {
      message: "Payment terms contain invalid characters or HTML",
    }),
  termsAndConditions: z
    .string()
    .min(1, "Terms and conditions are required")
    .transform(sanitizeInput)
    .refine((val) => val === sanitizeInput(val), {
      message: "Terms and conditions contain invalid characters or HTML",
    }),
});

export default function CreateQuotationForm({ contactId }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const currentDate = new Date();
  const validTillDate = addDays(currentDate, 7);

  const { loading, error, quotation } = useSelector((state) => state.quotation);
  const { userData, employeeData, loading: userLoading } = useSelector((state) => state.user) || {};

  useEffect(() => {
    dispatch(fetchUserByEmail());
  }, [dispatch]);

  const { contact } = useContactDetails(contactId);

  const staticData = useMemo(() => ({
    clientDetails: {
      contactId,
      name: contact?.fullName || "",
      company: contact?.companyName || "",
      email: contact?.email || "",
      phone: contact?.phone || "",
    },
    serviceProviderDetails,
    preparedBy: {
      name: `${employeeData?.firstName || ""} ${employeeData?.lastName || ""}`.trim(),
      designation: employeeData?.designation || "",
      email: employeeData?.email || "",
    },
  }), [contact, contactId, employeeData]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      projectTitle: "",
      scopeOfWork: "",
      deliverables: "",
      timeline: "",
      items: [{ serviceName: "", basePrice: "", sellPrice: "", currency: "INR" }],
      taxPercent: 18,
      currency: "INR",
      paymentTerms: "",
      termsAndConditions: "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchedFields = watch([
    "projectTitle",
    "scopeOfWork",
    "deliverables",
    "timeline",
    "paymentTerms",
    "termsAndConditions",
    "items",
  ]);

  const currency = watch("currency");
  const items = watch("items");
  const taxPercent = watch("taxPercent");

  // Real-time sanitization error checking
  useEffect(() => {
    const checkSanitization = (fieldName, value, index = null) => {
      if (typeof value === "string" && value && value !== sanitizeInput(value)) {
        const errorMessage = index !== null
          ? `Item ${index + 1}: ${fieldName.replace(/([A-Z])/g, " $1").toLowerCase()} contains invalid characters or HTML`
          : `${fieldName.replace(/([A-Z])/g, " $1").toLowerCase()} contains invalid characters or HTML`;
        toast.error(errorMessage);
        // Optionally, reset the field to sanitized value
        if (index !== null) {
          setValue(`items.${index}.serviceName`, sanitizeInput(value));
        } else {
          setValue(fieldName, sanitizeInput(value));
        }
      }
    };

    // Check single fields
    ["projectTitle", "scopeOfWork", "deliverables", "timeline", "paymentTerms", "termsAndConditions"].forEach((field) => {
      checkSanitization(field, watchedFields[field]);
    });
    // ["projectTitle", "scopeOfWork", "deliverables", "timeline", "paymentTerms", "termsAndConditions"].forEach((field) => {
    //   checkSanitization(field, watchedFields[field]);
    // });

    // Check items
    watchedFields.items?.forEach((item, index) => {
      checkSanitization("serviceName", item.serviceName, index);
    });
  }, [watchedFields, setValue]);

  // Sync item currencies with global currency
  useEffect(() => {
    items.forEach((_, idx) => {
      setValue(`items.${idx}.currency`, currency);
    });
  }, [currency, items, setValue]);

  // Calculate totals
  const subtotal = items.reduce((acc, item) => acc + Number(item.sellPrice || 0), 0);
  const taxAmount = (subtotal * Number(taxPercent || 0)) / 100;
  const total = subtotal + taxAmount;

  // Handle form submission with validation and toast
  const onSubmit = (Status) => async (data) => {
    try {
      // Trigger validation before submission
      const isValid = await trigger();
      if (!isValid) {
        Object.values(errors).forEach((err) => {
          if (err.message) {
            toast.error(err.message);
          } else if (err.items) {
            err.items.forEach((item, idx) => {
              Object.values(item || {}).forEach((itemErr) => {
                if (itemErr.message) {
                  toast.error(`Item ${idx + 1}: ${itemErr.message}`);
                }
              });
            });
          }
        });
        return;
      }

      const quotationData = {
        ...data,
        date: new Date().toISOString(),
        validTill: addDays(new Date(), 7).toISOString(),
        clientDetails: staticData.clientDetails,
        serviceProviderDetails: staticData.serviceProviderDetails,
        preparedBy: staticData.preparedBy,
        createdBy: employeeData?.email,
        Status,
      };

      const result = await dispatch(createQuotation(quotationData)).unwrap();
      if (result.pdf) {
        const blob = new Blob([result.pdf], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `quotation-${result.quotationNumber || "document"}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
      toast.success(`Quotation ${result.quotationNumber || "created"} successfully as ${Status}!`);
      router.push("/quotation");
    } catch (error) {
      toast.error(`Failed to create quotation: ${error || "Unknown error"}`);
    }
  };

  // Handle Redux errors
  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-4xl bg-white shadow-lg rounded-lg p-6">
<div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Create Quotation</h1>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="border-gray-300 hover:bg-gray-100"
          >
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Button>
        </div>          
        <form className="space-y-6">
          {/* Client and Provider Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-700">Client Information</h2>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Name: <span className="font-medium">{staticData.clientDetails.name}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Company: <span className="font-medium">{staticData.clientDetails.company}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Email: <span className="font-medium">{staticData.clientDetails.email}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Phone: <span className="font-medium">{staticData.clientDetails.phone}</span>
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-700">Service Provider</h2>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Company: <span className="font-medium">{staticData.serviceProviderDetails.companyName}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Email: <span className="font-medium">{staticData.serviceProviderDetails.email}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Phone: <span className="font-medium">{staticData.serviceProviderDetails.phone}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Website: <span className="font-medium">{staticData.serviceProviderDetails.website}</span>
                </p>
                <p className="text-sm text-gray-600">
                  GSTIN: <span className="font-medium">{staticData.serviceProviderDetails.gstin}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-700">Project Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Project Title</Label>
                <Input {...register("projectTitle")} placeholder="Enter project title" className="mt-1" />
                {errors.projectTitle && <p className="text-red-500 text-xs mt-1">{errors.projectTitle.message}</p>}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Timeline</Label>
                <Input {...register("timeline")} placeholder="e.g., 4 weeks" className="mt-1" />
                {errors.timeline && <p className="text-red-500 text-xs mt-1">{errors.timeline.message}</p>}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Scope of Work</Label>
              <Textarea {...register("scopeOfWork")} placeholder="Describe the scope of work" rows={4} className="mt-1" />
              {errors.scopeOfWork && <p className="text-red-500 text-xs mt-1">{errors.scopeOfWork.message}</p>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Deliverables</Label>
              <Textarea {...register("deliverables")} placeholder="List project deliverables" rows={4} className="mt-1" />
              {errors.deliverables && <p className="text-red-500 text-xs mt-1">{errors.deliverables.message}</p>}
            </div>
          </div>

          {/* Currency and Tax */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-700">Financial Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Currency</Label>
                <Select
                  onValueChange={(value) => setValue("currency", value)}
                  defaultValue="INR"
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.currency && <p className="text-red-500 text-xs mt-1">{errors.currency.message}</p>}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Tax Percentage</Label>
                <Input type="number" step="0.01" {...register("taxPercent")} placeholder="18" className="mt-1" />
                {errors.taxPercent && <p className="text-red-500 text-xs mt-1">{errors.taxPercent.message}</p>}
              </div>
            </div>
          </div>

          {/* Service Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-700">Service Items</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-gray-300 hover:bg-gray-100"
                onClick={() => append({ serviceName: "", basePrice: "", sellPrice: "", currency })}
              >
                Add Item
              </Button>
            </div>
            {fields.map((item, index) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-5">
                  <Label className="text-sm font-medium text-gray-600">Service Description</Label>
                  <Input {...register(`items.${index}.serviceName`)} placeholder="Service Description" className="mt-1" />
                  {errors.items?.[index]?.serviceName && (
                    <p className="text-red-500 text-xs mt-1">{errors.items[index].serviceName.message}</p>
                  )}
                </div>
                <div className="md:col-span-3">
                  <Label className="text-sm font-medium text-gray-600">Base Price</Label>
                  <div className="relative">
                    <span className="absolute top-2.5 left-3 text-sm text-gray-600">{currency === "USD" ? "$" : "₹"}</span>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.basePrice`)}
                      placeholder="0.00"
                      className="pl-8 mt-1"
                    />
                  </div>
                  {errors.items?.[index]?.basePrice && (
                    <p className="text-red-500 text-xs mt-1">{errors.items[index].basePrice.message}</p>
                  )}
                </div>
                <div className="md:col-span-3">
                  <Label className="text-sm font-medium text-gray-600">Sell Price</Label>
                  <div className="relative">
                    <span className="absolute top-2.5 left-3 text-sm text-gray-600">{currency === "USD" ? "$" : "₹"}</span>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.sellPrice`)}
                      placeholder="0.00"
                      className="pl-8 mt-1"
                    />
                  </div>
                  {errors.items?.[index]?.sellPrice && (
                    <p className="text-red-500 text-xs mt-1">{errors.items[index].sellPrice.message}</p>
                  )}
                </div>
                <div className="md:col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-gray-300 hover:text-white hover:bg-red-800"
                    onClick={() => remove(index)}
                  >
                    <Trash/>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-700">Financial Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax ({taxPercent || 0}%)</span>
                <span className="font-medium">{formatCurrency(taxAmount, currency)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Amount</span>
                <span>{formatCurrency(total, currency)}</span>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-700">Terms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Payment Terms</Label>
                <Textarea {...register("paymentTerms")} placeholder="Enter payment terms" rows={4} className="mt-1" />
                {errors.paymentTerms && <p className="text-red-500 text-xs mt-1">{errors.paymentTerms.message}</p>}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Terms & Conditions</Label>
                <Textarea {...register("termsAndConditions")} placeholder="Enter terms and conditions" rows={4} className="mt-1" />
                {errors.termsAndConditions && <p className="text-red-500 text-xs mt-1">{errors.termsAndConditions.message}</p>}
              </div>
            </div>
          </div>

          {/* Prepared By */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-700">Prepared By</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-600">Name: </span>
                <span className="font-medium">{staticData.preparedBy.name}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Designation: </span>
                <span className="font-medium">{staticData.preparedBy.designation}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Email: </span>
                <span className="font-medium">{staticData.preparedBy.email}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              onClick={handleSubmit(onSubmit("draft"))}
              variant="outline"
              disabled={loading}
              className="border-gray-300 hover:bg-gray-100"
            >
              {loading ? "Saving..." : "Save as Draft"}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit(onSubmit("final"))}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Creating..." : "Create Quotation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}