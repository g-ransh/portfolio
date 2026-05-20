/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Experience from './components/Experience';
import Overlay from './components/Overlay';

export default function App() {
  return (
    <main className="relative h-screen w-full bg-[#050505]">
      {/* 3D Scene Layer */}
      <Experience />
      
      {/* Interactive UI Layer */}
      <Overlay />
    </main>
  );
}
