


// components/client/EditClientForm.js

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import DOMPurify from 'dompurify';
import {
  updateClient,
  fetchClientById,
  updateFormData,
  addFile,
  removeFile,
} from '@/features/clientSlice';
import { fetchIndustries } from '@/features/master/industriesMasterSlice';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { File, ArrowLeft, Download, X, UploadCloud } from 'lucide-react';

export default function EditClientForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const { id: clientId } = params;

  const { formData, loading, error } = useSelector((state) => state.client);
  const { industries } = useSelector((state) => state.industries);
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [filesToDelete, setFilesToDelete] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (clientId) dispatch(fetchClientById(clientId));
    dispatch(fetchIndustries());
  }, [clientId, dispatch]);

  const validate = (name, value) => {
    const val = DOMPurify.sanitize(value);
    switch (name) {
      case 'clientName':
      case 'industryType':
      case 'contactPersonName':
        return val.length < 2 ? 'Required' : '';
      case 'contactEmail':
        return /^\S+@\S+\.\S+$/.test(val) ? '' : 'Invalid email';
      case 'contactNo':
        return /^[\d\s+-]{7,15}$/.test(val) ? '' : 'Invalid contact number';
      case 'website':
        return val && !/^https?:\/\/.+\..+$/.test(val) ? 'Invalid URL' : '';
      case 'address':
        return val.length < 5 ? 'Too short' : '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateFormData({ [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleFile = (e) => {
    const files = e.target.files;
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((e) => ({ ...e, fileData: 'File too large (max 5MB)' }));
        return;
      }
      dispatch(
        addFile({
          name: file.name,
          size: file.size,
          type: file.type,
          data: file,
          isNew: true,
        })
      );
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errMap = {};
    Object.entries(formData).forEach(([k, v]) => {
      if (k !== 'fileData') errMap[k] = validate(k, v);
    });
    if (Object.values(errMap).some(Boolean)) {
      setErrors(errMap);
      return;
    }

    const payload = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (k === 'fileData') {
        v.forEach((f) => f.data && payload.append('fileData', f.data));
      } else {
        payload.append(k, v);
      }
    });
    payload.append('clientId', clientId);
    payload.append('filesToDelete', JSON.stringify(filesToDelete));

    try {
      await dispatch(updateClient(payload)).unwrap();
      toast.success('Client updated');
      router.push('/client');
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <Card className="border shadow-xl">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          {/* <Button variant="outline" onClick={() => router.back()} className="rounded-full text-gray-700 border border-gray-300 hover:bg-gray-100 px-3 py-1">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button> */}
                  <button
  onClick={() => router.back()}
  className="inline-flex cursor-pointer items-center gap-2 bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-full shadow-md hover:bg-blue-800 hover:shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
>
  <svg
    className="h-4 w-4"
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
</button>
          <CardTitle className="text-xl font-semibold text-gray-800">Edit Client</CardTitle>
          <div className="w-20" />
        </div>
      </CardHeader>
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col w-full gap-1.5">
            <Label htmlFor="clientName">Client Name</Label>
            <Input name="clientName" value={formData.clientName || ''} onChange={handleChange} />
            {errors.clientName && <p className="text-sm text-red-500">{errors.clientName}</p>}
          </div>

          <div className="flex flex-col w-full gap-1.5">
            <Label>Industry</Label>
            <Select value={formData.industryType || ''} onValueChange={(val) => dispatch(updateFormData({ industryType: val }))}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select Industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((item) => (
                  <SelectItem key={item._id} value={item.Industryname}>{item.Industryname}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.industryType && <p className="text-sm text-red-500">{errors.industryType}</p>}
          </div>

          <div className="flex flex-col w-full gap-1.5">
            <Label htmlFor="contactEmail">Email</Label>
            <Input name="contactEmail" value={formData.contactEmail || ''} onChange={handleChange} />
            {errors.contactEmail && <p className="text-sm text-red-500">{errors.contactEmail}</p>}
          </div>

          <div className="flex flex-col w-full gap-1.5">
            <Label htmlFor="contactNo">Contact No</Label>
            <Input name="contactNo" value={formData.contactNo || ''} onChange={handleChange} />
            {errors.contactNo && <p className="text-sm text-red-500">{errors.contactNo}</p>}
          </div>

          <div className="flex flex-col w-full gap-1.5">
            <Label htmlFor="contactPersonName">Contact Person</Label>
            <Input name="contactPersonName" value={formData.contactPersonName || ''} onChange={handleChange} />
            {errors.contactPersonName && <p className="text-sm text-red-500">{errors.contactPersonName}</p>}
          </div>

          <div className="flex flex-col w-full gap-1.5">
            <Label htmlFor="onboardingDate">Onboarding Date</Label>
            <Input name="onboardingDate" value={formData.onboardingDate?.split('T')[0] || ''} readOnly disabled className="bg-gray-100 cursor-not-allowed" />
          </div>

          <div className="flex flex-col w-full gap-1.5 sm:col-span-2">
            <Label htmlFor="website">Website</Label>
            <Input name="website" value={formData.website || ''} onChange={handleChange} />
            {errors.website && <p className="text-sm text-red-500">{errors.website}</p>}
          </div>

          <div className="flex flex-col w-full gap-1.5 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea name="address" value={formData.address || ''} onChange={handleChange} />
            {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
          </div>

          <div
            className={`mt-1 p-5 flex flex-col items-center justify-center text-center gap-2 border-2 border-dashed rounded-md cursor-pointer transition sm:col-span-2 ${dragActive ? 'border-gray-600 bg-gray-50' : 'border-gray-300 hover:border-gray-500'}`}
            onClick={() => fileInputRef.current.click()}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <UploadCloud className="w-6 h-6 text-gray-500" />
            <p className="text-sm text-gray-600">Drag & drop files here or click to upload</p>
            <Input
              ref={fileInputRef}
              type="file"
              name="fileData"
              multiple
              onChange={handleFile}
              className="hidden"
            />
            {formData.fileData?.length > 0 && (
              <div className="mt-4 w-full flex flex-col gap-2">
                {formData.fileData.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3 py-2 rounded border border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2 truncate text-sm text-gray-700">
                      <File className="w-4 h-4 text-gray-500" /> <span className="truncate">{file.name}</span>
                    </div>
                    <Button variant="ghost" className="text-red-500 hover:text-red-700 px-2 py-0" onClick={() => dispatch(removeFile(idx))}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {errors.fileData && <p className="text-sm text-red-500 mt-1">{errors.fileData}</p>}
          </div>

          <div className="sm:col-span-2 flex justify-center mt-6">
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600  text-white px-6 py-2 rounded-md">
              Update Client
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
