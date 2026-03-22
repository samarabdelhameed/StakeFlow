"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { arbitrumSepolia, mainnet, hardhat } from "wagmi/chains";
import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { Toaster } from 'react-hot-toast';
import "@rainbow-me/rainbowkit/styles.css";

// Use environment variable or fallback to demo mode
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID";

// Create Wagmi config with proper error handling
const config = createConfig({
  chains: [arbitrumSepolia, mainnet, hardhat],
  transports: {
    [arbitrumSepolia.id]: http(),
    [mainnet.id]: http(),
    [hardhat.id]: http(),
  },
  ssr: true,
});


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Error Boundary for Wagmi
class WagmiErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn("Wagmi Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.children;
    }

    return this.props.children;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: "var(--neon-green)",
              accentColorForeground: "var(--bg-primary)",
              borderRadius: "medium",
              fontStack: "system",
              overlayBlur: "small",
            })}
            showRecentTransactions={true}
            coolMode={true}
          >
            {mounted ? children : (
              <div style={{ visibility: "hidden" }}>{children}</div>
            )}
            <Toaster 
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#0f172a',
                  color: '#fff',
                  border: '1px solid #334155',
                },
              }}
            />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </WagmiErrorBoundary>
  );
}
