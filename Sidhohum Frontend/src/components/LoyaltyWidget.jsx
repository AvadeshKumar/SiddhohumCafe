import React from 'react'
import { Award, Sparkles, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCafe } from '../context/CafeContext'

export const LoyaltyWidget = () => {
  const { user } = useAuth()
  const { settings } = useCafe()

  const rewardConfig = settings?.rewardConfig || { ordersRequired: 5, pointsAwarded: 30 }
  const ordersCompleted = user?.completedOrdersCount || 0
  const ordersRequired = rewardConfig.ordersRequired || 5
  const pointsAwarded = rewardConfig.pointsAwarded || 30

  // Calculate progress in current batch of 5
  const currentBatchProgress = ordersCompleted % ordersRequired
  const ordersLeft = ordersRequired - currentBatchProgress
  const percentComplete = Math.min(100, Math.round((currentBatchProgress / ordersRequired) * 100))

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shadow-inner">
            <Award className="w-5 h-5 text-amber-800" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-1.5 py-0.5 rounded">
              Loyalty Rewards
            </span>
            <h4 className="font-display font-bold text-sm text-stone-900">
              {ordersLeft === 0
                ? 'Milestone Achieved! 🎉'
                : `${currentBatchProgress} / ${ordersRequired} Orders Completed`}
            </h4>
          </div>
        </div>

        {/* Current Total Points Badge */}
        <div className="text-right">
          <span className="text-[10px] text-stone-500 font-medium block">Total Balance</span>
          <span className="bg-amber-600 text-stone-950 font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-sm inline-block">
            {user?.rewardPoints || 0} Pts
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="w-full bg-amber-200/70 h-2.5 rounded-full overflow-hidden p-0.5">
          <div
            className="bg-amber-600 h-full rounded-full transition-all duration-700 shadow-sm"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
        <p className="text-[11px] text-amber-900/90 font-medium flex items-center justify-between">
          <span>
            {ordersLeft === 1
              ? `Only 1 more qualifying order for ${pointsAwarded} points!`
              : `${ordersLeft} more orders to earn ${pointsAwarded} bonus points.`}
          </span>
          <span className="text-stone-400 font-bold">{percentComplete}%</span>
        </p>
      </div>
    </div>
  )
}
