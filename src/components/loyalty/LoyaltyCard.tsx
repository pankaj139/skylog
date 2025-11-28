import { Award } from 'lucide-react';
import { calculateLoyaltyStatus, getTierColor } from '../../services/loyaltyService';

interface LoyaltyCardProps {
    totalDistance: number;
}

export default function LoyaltyCard({ totalDistance }: LoyaltyCardProps) {
    const status = calculateLoyaltyStatus(totalDistance);
    const tierColor = getTierColor(status.tier);

    return (
        <div className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${tierColor} shadow-lg text-white`}>
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                <Award size={200} />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-lg font-medium opacity-90 uppercase tracking-wider">SkyLog Elite</h3>
                        <div className="text-3xl font-bold mt-1">{status.tier} Member</div>
                    </div>
                    <Award size={40} className="opacity-80" />
                </div>

                <div className="mb-6">
                    <div className="text-sm opacity-80 mb-1">Total Distance Flown</div>
                    <div className="text-2xl font-mono">{Math.round(status.totalDistance).toLocaleString()} km</div>
                </div>

                {status.nextTier && (
                    <div>
                        <div className="flex justify-between text-xs font-medium mb-2 opacity-90">
                            <span>Progress to {status.nextTier}</span>
                            <span>{Math.round(status.distanceToNext).toLocaleString()} km to go</span>
                        </div>
                        <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white/90 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${status.progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {!status.nextTier && (
                    <div className="flex items-center gap-2 text-sm font-medium bg-white/20 px-3 py-1.5 rounded-lg w-fit">
                        <Award size={16} />
                        Top Tier Status Achieved
                    </div>
                )}
            </div>
        </div>
    );
}
