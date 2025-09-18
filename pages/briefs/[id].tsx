import React from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Link from 'next/link';
import axios from 'axios';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function BriefDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data, error, isLoading } = useSWR(id ? `/briefs/${id}` : null, fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading brief.</div>;
  if (!data) return null;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Content Brief</h1>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Outline</h2>
        <ul className="ml-4 list-disc">
          {data.outline?.map((item: any, idx: number) => (
            <li key={idx}><span className="font-bold">{item.type}:</span> {item.heading}</li>
          ))}
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Entities</h2>
        <ul className="ml-4 list-disc">
          {data.entities?.map((entity: string, idx: number) => (
            <li key={idx}>{entity}</li>
          ))}
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">FAQs</h2>
        <ul className="ml-4 list-disc">
          {data.faqs?.map((faq: any, idx: number) => (
            <li key={idx}><strong>Q:</strong> {faq.question}<br /><strong>A:</strong> {faq.answer}</li>
          ))}
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Internal Links</h2>
        <ul className="ml-4 list-disc">
          {data.internalLinks?.map((link: any, idx: number) => (
            <li key={idx}><Link href={`/pages/${link.pageId}`} className="text-blue-600 underline">{link.anchorText}</Link></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
