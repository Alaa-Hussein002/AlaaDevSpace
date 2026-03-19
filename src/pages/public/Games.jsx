import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Play, Trophy, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { publicAPI } from '@/api/services';
import FavoriteButton from '@/components/ui/favorite-button';

export default function Games() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const { data } = await publicAPI.getGames();
      setGames(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const difficultyColor = { easy: 'bg-green-500', medium: 'bg-yellow-500', hard: 'bg-red-500' };
  const difficultyLabel = { easy: 'سهل', medium: 'متوسط', hard: 'صعب' };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 px-3 py-1">
            <Gamepad2 className="w-3 h-3 ml-1" />
            ترفيه
          </Badge>
          <h1 className="text-4xl font-bold mb-3">
            صالة <span className="gradient-text">الألعاب</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            ألعاب فورية ممتعة تختبر ذكاءك وسرعة بديهتك — العب وتنافس مع الآخرين!
          </p>
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : games.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Gamepad2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد ألعاب حالياً</p>
            <p className="text-xs text-muted-foreground/60 mt-1">سيتم إضافة ألعاب ممتعة قريباً!</p>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game, i) => (
              <motion.div key={game.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="overflow-hidden card-hover group border-border/50 bg-card/80">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {game.cover_image ? (
                      <img src={game.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
                        <Gamepad2 className="w-16 h-16 text-primary/30" />
                      </div>
                    )}
                    <Badge className={`absolute top-3 right-3 ${difficultyColor[game.difficulty] || 'bg-gray-500'} text-white border-0 text-[10px]`}>
                      {difficultyLabel[game.difficulty] || game.difficulty}
                    </Badge>
                    {game.is_featured && (
                      <Badge className="absolute top-3 left-3 bg-yellow-500 text-black border-0 text-[10px]">
                        <Star className="w-2.5 h-2.5 ml-0.5" /> مميزة
                      </Badge>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-1">{game.name?.ar || game.name?.en}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {game.description?.ar || game.description?.en}
                    </p>

                    <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {game.stats?.play_count || 0} لعبة</span>
                      <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> أعلى: {game.stats?.highest_score || 0}</span>
                    </div>

                    <div className="absolute top-3 left-3">
                      <FavoriteButton item={game} type="game" />
                    </div>

                    <Button className="w-full gradient-bg text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30">
                      <Zap className="w-4 h-4 ml-2" />
                      العب الآن
                    </Button>

                    {game.rewards?.enable_rewards && (
                      <p className="text-[10px] text-center text-primary mt-2">
                        🎁 {game.rewards.reward_description}
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}