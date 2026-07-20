import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Work Items',
  robots: {
    index: false,
    follow: false,
  },
};

export default function WorkItemsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <section>{children}</section>;
}
