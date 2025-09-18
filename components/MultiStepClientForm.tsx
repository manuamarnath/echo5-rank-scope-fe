import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
// Import shadcn-ui components as needed

const steps = [
  'Business Info',
  'Services',
  'Competitors',
  'Integrations',
];

export default function MultiStepClientForm() {
  const [step, setStep] = useState(0);
  const { control, handleSubmit, register, getValues, setValue } = useForm({
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

  const mutation = useMutation<any, Error, any>({
    mutationFn: async (data: any) => {
      const res = await axios.post('/clients', data);
      return res.data;
    },
  });

  const onNext = () => setStep((s: number) => Math.min(s + 1, steps.length - 1));
  const onPrev = () => setStep((s: number) => Math.max(s - 1, 0));

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">{steps[step]}</h2>
      {step === 0 && (
        <div className="space-y-2">
          <input {...register('name', { required: true })} placeholder="Business Name" className="input" />
          <input {...register('industry')} placeholder="Industry" className="input" />
          <input {...register('locations.0.city')} placeholder="City" className="input" />
          <input {...register('locations.0.state')} placeholder="State" className="input" />
          <input {...register('locations.0.country')} placeholder="Country" className="input" />
          <input {...register('locations.0.zip')} placeholder="ZIP" className="input" />
        </div>
      )}
      {step === 1 && (
        <div className="space-y-2">
          {/* Services array */}
          {getValues('services').map((_: any, idx: number) => (
            <input key={idx} {...register(`services.${idx}`)} placeholder={`Service ${idx + 1}`} className="input" />
          ))}
          <button type="button" onClick={() => setValue(`services.${getValues('services').length}`, '')} className="btn">Add Service</button>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-2">
          {/* Competitors array */}
          {getValues('competitors').map((_: any, idx: number) => (
            <input key={idx} {...register(`competitors.${idx}`)} placeholder={`Competitor URL ${idx + 1}`} className="input" />
          ))}
          <button type="button" onClick={() => setValue(`competitors.${getValues('competitors').length}`, '')} className="btn">Add Competitor</button>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-2">
          <h3 className="font-semibold">GSC</h3>
          <input {...register('integrations.gsc.clientId')} placeholder="GSC Client ID" className="input" />
          <input {...register('integrations.gsc.clientSecret')} placeholder="GSC Client Secret" className="input" />
          <input {...register('integrations.gsc.refreshToken')} placeholder="GSC Refresh Token" className="input" />
          <h3 className="font-semibold">GA4</h3>
          <input {...register('integrations.ga4.propertyId')} placeholder="GA4 Property ID" className="input" />
          <input {...register('integrations.ga4.accessToken')} placeholder="GA4 Access Token" className="input" />
          <input {...register('integrations.ga4.refreshToken')} placeholder="GA4 Refresh Token" className="input" />
          <h3 className="font-semibold">GBP</h3>
          <input {...register('integrations.gbp.accountId')} placeholder="GBP Account ID" className="input" />
          {/* GBP locationIds array */}
          {getValues('integrations.gbp.locationIds').map((_: any, idx: number) => (
            <input key={idx} {...register(`integrations.gbp.locationIds.${idx}`)} placeholder={`GBP Location ID ${idx + 1}`} className="input" />
          ))}
          <button type="button" onClick={() => setValue(`integrations.gbp.locationIds.${getValues('integrations.gbp.locationIds').length}`, '')} className="btn">Add GBP Location</button>
        </div>
      )}
      <div className="flex gap-2 mt-6">
        {step > 0 && <button type="button" onClick={onPrev} className="btn">Back</button>}
        {step < steps.length - 1 && <button type="button" onClick={onNext} className="btn">Next</button>}
  {step === steps.length - 1 && <button type="submit" className="btn" disabled={mutation.status === 'pending'}>Submit</button>}
      </div>
      {mutation.isSuccess && <div className="mt-4 text-green-600">Client created!</div>}
      {mutation.isError && <div className="mt-4 text-red-600">Error: {mutation.error.message}</div>}
    </form>
  );
}
