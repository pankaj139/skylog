import { Sparkles, MapPin } from 'lucide-react';
import type { Recommendation } from '../../services/recommendationService';

interface RecommendationCardProps {
    recommendation: Recommendation;
}

export default function RecommendationCard({ recommendation }: RecommendationCardProps) {
    return (
        <div className="glass rounded-xl overflow-hidden border border-white/10 group hover:border-neon-blue/50 transition-all duration-300 hover:scale-[1.02]">
            <div className="relative h-48 overflow-hidden">
                <img
                    src={recommendation.imageUrl}
                    alt={recommendation.city}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                    <Sparkles size={14} className="text-yellow-400" />
                    <span className="text-xs font-bold text-white">{recommendation.matchScore}% Match</span>
                </div>
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-xl font-bold text-white">{recommendation.city}</h3>
                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                            <MapPin size={14} />
                            {recommendation.country}
                        </div>
                    </div>
                </div>

                <p className="text-sm text-gray-300 mt-3 italic border-l-2 border-neon-blue pl-3">
                    "{recommendation.reason}"
                </p>

                <button className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-white transition-colors">
                    View Flights
                </button>
            </div>
        </div>
    );
}
