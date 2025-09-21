import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ClientFormData {
  name: string;
  industry: string;
  locations: Array<{ city: string; state: string; country: string; zip: string }>;
  services: string[];
  competitors: string[];
  integrations: {
    gsc: { clientId: string; clientSecret: string; refreshToken: string };
    ga4: { propertyId: string; accessToken: string; refreshToken: string };
    gbp: { accountId: string; locationIds: string[] };
  };
}

interface ClientResponse {
  id: string;
  name: string;
  // Add other response properties as needed
}

const steps = [
  'Business Info',
  'Services',
  'Competitors',
  'Integrations',
];

export default function MultiStepClientForm() {
  const [step, setStep] = useState(0);
  const { handleSubmit, register, getValues, setValue } = useForm({
    defaultValues: {
      name: '',
      industry: '',
      locations: [{ city: '', state: '', country: '', zip: '' }],
      services: [''],
      competitors: [''],
      integrations: {
        gsc: { clientId: '', clientSecret: '', refreshToken: '' },
        ga4: { propertyId: '', accessToken: '', refreshToken: '' },
        gbp: { accountId: '', locationIds: [''] },
      },
    },
  });

  const mutation = useMutation<ClientResponse, Error, ClientFormData>({
    mutationFn: async (data: ClientFormData) => {
      const res = await axios.post<ClientResponse>('/clients', data);
      return res.data;
    },
  });

  const onNext = () => setStep((s: number) => Math.min(s + 1, steps.length - 1));
  const onPrev = () => setStep((s: number) => Math.max(s - 1, 0));

  const onSubmit = (data: ClientFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">{steps[step]}</h2>
      {step === 0 && (
        <div className="space-y-2">
          <Input {...register('name', { required: true })} placeholder="Business Name" />
          <Input {...register('industry')} placeholder="Industry" />
          <Input {...register('locations.0.city')} placeholder="City" />
          <Input {...register('locations.0.state')} placeholder="State" />
          <Input {...register('locations.0.country')} placeholder="Country" />
          <Input {...register('locations.0.zip')} placeholder="ZIP" />
        </div>
      )}
      {step === 1 && (
        <div className="space-y-2">
          {/* Services array */}
          {getValues('services').map((_: string, idx: number) => (
            <Input key={idx} {...register(`services.${idx}`)} placeholder={`Service ${idx + 1}`} />
          ))}
          <Button type="button" onClick={() => setValue(`services.${getValues('services').length}`, '')} variant="outline">Add Service</Button>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-2">
          {/* Competitors array */}
          {getValues('competitors').map((_: string, idx: number) => (
            <Input key={idx} {...register(`competitors.${idx}`)} placeholder={`Competitor URL ${idx + 1}`} />
          ))}
          <Button type="button" onClick={() => setValue(`competitors.${getValues('competitors').length}`, '')} variant="outline">Add Competitor</Button>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-2">
          <h3 className="font-semibold">GSC</h3>
          <Input {...register('integrations.gsc.clientId')} placeholder="GSC Client ID" />
          <Input {...register('integrations.gsc.clientSecret')} placeholder="GSC Client Secret" />
          <Input {...register('integrations.gsc.refreshToken')} placeholder="GSC Refresh Token" />
          <h3 className="font-semibold">GA4</h3>
          <Input {...register('integrations.ga4.propertyId')} placeholder="GA4 Property ID" />
          <Input {...register('integrations.ga4.accessToken')} placeholder="GA4 Access Token" />
          <Input {...register('integrations.ga4.refreshToken')} placeholder="GA4 Refresh Token" />
          <h3 className="font-semibold">GBP</h3>
          <Input {...register('integrations.gbp.accountId')} placeholder="GBP Account ID" />
          {/* GBP locationIds array */}
          {getValues('integrations.gbp.locationIds').map((_: string, idx: number) => (
            <Input key={idx} {...register(`integrations.gbp.locationIds.${idx}`)} placeholder={`GBP Location ID ${idx + 1}`} />
          ))}
          <Button type="button" onClick={() => setValue(`integrations.gbp.locationIds.${getValues('integrations.gbp.locationIds').length}`, '')} variant="outline">Add GBP Location</Button>
        </div>
      )}
      <div className="flex justify-between mt-4">
        <Button type="button" onClick={onPrev} disabled={step === 0} variant="outline">Previous</Button>
        <Button type="button" onClick={onNext} disabled={step === steps.length - 1} variant="outline">Next</Button>
        {step === steps.length - 1 && <Button type="submit" disabled={mutation.status === 'pending'}>Submit</Button>}
      </div>
      {mutation.isSuccess && <div className="mt-4 text-green-600">Client created!</div>}
      {mutation.isError && <div className="mt-4 text-red-600">Error: {mutation.error.message}</div>}
    </form>
  );
}
