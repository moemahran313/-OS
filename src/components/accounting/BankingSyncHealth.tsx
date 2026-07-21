import React, { useState, useEffect } from "react";
import { Activity, Wifi, WifiOff, AlertTriangle, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { auth } from "../../lib/firebase";
import { toast } from "sonner";

interface Connection {
  id: string;
  bankName: string;
  accountNo: string;
  provider: string;
  lastSyncedAt?: string;
  connectedAt?: string;
}

export default function BankingSyncHealth() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [pingStatus, setPingStatus] = useState<"GREEN" | "YELLOW" | "RED">("GREEN");
  const [lastPingTime, setLastPingTime] = useState<string>(new Date().toISOString());
  const [lastPullTime, setLastPullTime] = useState<string>("");
  const [checking, setChecking] = useState(false);

  const checkHealth = async (showToast = false) => {
    setChecking(true);
    try {
      await auth.authStateReady();
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        setPingStatus("RED");
        setLoading(false);
        setChecking(false);
        return;
      }

      const res = await fetch("/api/accounting/banking/accounts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setConnections(data);

        // Determine health based on actual connections
        if (!data || data.length === 0) {
          setPingStatus("YELLOW");
          setLastPullTime("");
        } else {
          // Check last sync time of the most recent connection
          const sorted = [...data].sort((a, b) => {
            const timeA = new Date(a.lastSyncedAt || a.connectedAt || 0).getTime();
            const timeB = new Date(b.lastSyncedAt || b.connectedAt || 0).getTime();
            return timeB - timeA;
          });

          const latest = sorted[0];
          const lastSyncStr = latest.lastSyncedAt || latest.connectedAt;
          setLastPullTime(lastSyncStr || new Date().toISOString());

          const lastSyncTime = new Date(lastSyncStr || 0).getTime();
          const hoursSinceSync = (Date.now() - lastSyncTime) / (1000 * 60 * 60);

          if (hoursSinceSync < 1) {
            setPingStatus("GREEN");
          } else if (hoursSinceSync < 24) {
            setPingStatus("GREEN");
          } else {
            setPingStatus("YELLOW");
          }
        }
        
        setLastPingTime(new Date().toISOString());
        if (showToast) {
          toast.success("تم بنجاح فحص اتصال الربط المباشر مع مؤسسة النقد وبوابات المالية المفتوحة (SAMA).");
        }
      } else {
        setPingStatus("RED");
        if (showToast) {
          toast.error("فشل الاتصال بخادم بوابة المالية المفتوحة.");
        }
      }
    } catch (err) {
      console.error(err);
      setPingStatus("RED");
    } finally {
      setLoading(false);
      setChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
    // Auto refresh every 60s
    const interval = setInterval(() => checkHealth(false), 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (pingStatus) {
      case "GREEN":
        return {
          bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          ping: "bg-emerald-500",
          text: "مستقر ومتصل",
        };
      case "YELLOW":
        return {
          bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          ping: "bg-amber-500",
          text: "متصل (تحذير مزامنة)",
        };
      case "RED":
        return {
          bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
          ping: "bg-rose-500",
          text: "الربط معطل أو منقطع",
        };
    }
  };

  const status = getStatusColor();

  return (
    <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl p-3 shadow-sm select-none">
      <div className="relative">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${status.bg} border`}>
          {pingStatus === "RED" ? (
            <WifiOff className="w-4 h-4" />
          ) : (
            <Wifi className="w-4 h-4" />
          )}
        </div>
        <span className="absolute -top-1 -left-1 flex h-3.5 w-3.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.ping}`}></span>
          <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${status.ping}`}></span>
        </span>
      </div>

      <div className="text-right space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black text-zinc-800 dark:text-zinc-200">
            حالة الربط المصرفي (Open Banking)
          </span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${status.bg}`}>
            {status.text}
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-[9px] text-zinc-400 font-bold">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-zinc-400" />
            <span>آخر استجابة:</span>
            <span className="font-mono text-zinc-500">
              {new Date(lastPingTime).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span>آخر سحب بيانات:</span>
            <span className="font-mono text-zinc-500">
              {lastPullTime 
                ? new Date(lastPullTime).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }) 
                : "—"}
            </span>
          </span>
        </div>
      </div>

      <button
        onClick={() => checkHealth(true)}
        disabled={checking}
        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer mr-auto"
        title="تحديث حالة البوابة وفحص الاتصال"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin text-emerald-500" : ""}`} />
      </button>
    </div>
  );
}
