// app/components/navigation/footer/index.tsx
import Link from 'next/link';

// export default function Footer() {
//   return (
//     <footer className="bg-gray-800 text-gray-400 py-4 w-full absolute bottom-0 left-0">
//       <div className="container mx-auto text-center">
//         <p className="text-sm">
//           © {new Date().getFullYear()} SigmaSavings. All rights reserved.
//         </p>
//         <p className="text-sm mt-2">
//           <Link href="/contact" className="hover:text-white">
//             Impressum
//           </Link>
//         </p>
//       </div>
//     </footer>
//   );
// }
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-400 py-4 w-full fixed bottom-0 left-0">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} SigmaSavings. All rights reserved.
        </p>
        <p className="text-sm mt-2">
          <Link href="/contact" className="hover:text-white">
            Impressum
          </Link>
        </p>
      </div>
    </footer>
  );
}