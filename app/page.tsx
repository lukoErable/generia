'use client';

import { FC } from 'react';
import Links from './components/Home/Links';

const Home: FC = () => {
  return (
    <main className="min-h-screen text-base-content bg-base-200">
      <div className="mx-auto ">
        <Links />
      </div>
    </main>
  );
};

export default Home;
