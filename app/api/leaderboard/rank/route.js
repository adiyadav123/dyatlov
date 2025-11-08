export async function POST(request) {
  try {
    const body = await request.json();
    const { participants } = body;

    if (!participants || !Array.isArray(participants)) {
      return Response.json(
        { error: "Invalid participants data" },
        { status: 400 }
      );
    }

    console.log("[Ranking API] Received participants:", participants.length);

    // Calculate metrics for each participant using user_progress data
    const enrichedParticipants = participants.map((p) => {
      // Use totalTimeMs directly from user_progress or calculate from first/latest
      let totalTimeMs = p.totalTimeMs || 0;
      
      if (!totalTimeMs && p.firstDiscoveryTime && p.latestDiscoveryTime) {
        const firstTime = new Date(p.firstDiscoveryTime).getTime();
        const lastTime = new Date(p.latestDiscoveryTime).getTime();
        totalTimeMs = lastTime - firstTime;
      }
      
      const totalTimeMinutes = Math.floor(totalTimeMs / (1000 * 60));
      const totalTimeHours = Math.floor(totalTimeMs / (1000 * 60 * 60));
      
      return {
        ...p,
        sitesDiscovered: p.sitesDiscovered || 0,
        totalTimeMs,
        totalTimeMinutes,
        totalTimeHours,
        totalTimeDisplay: totalTimeHours > 0 
          ? `${totalTimeHours}h ${totalTimeMinutes % 60}m`
          : `${totalTimeMinutes}m`
      };
    });

    // Sort by:
    // 1. Pages visited (DESC - more is better)
    // 2. First discovery time (ASC - earlier is better) - who discovered first wins
    // 3. Registration time (ASC - earlier registrants win as tiebreaker)
    enrichedParticipants.sort((a, b) => {
      // Primary: More pages visited = higher rank
      if (a.sitesDiscovered !== b.sitesDiscovered) {
        return b.sitesDiscovered - a.sitesDiscovered;
      }
      
      // Secondary: Earlier first discovery = higher rank (for same number of pages)
      const aFirstTime = a.firstDiscoveryTime ? new Date(a.firstDiscoveryTime).getTime() : Infinity;
      const bFirstTime = b.firstDiscoveryTime ? new Date(b.firstDiscoveryTime).getTime() : Infinity;
      
      if (aFirstTime !== bFirstTime) {
        return aFirstTime - bFirstTime;
      }
      
      // Tertiary: Earlier registration time = higher rank (tiebreaker)
      const aRegTime = a.registeredAt ? new Date(a.registeredAt).getTime() : Infinity;
      const bRegTime = b.registeredAt ? new Date(b.registeredAt).getTime() : Infinity;
      return aRegTime - bRegTime;
    });

    // Generate rankings with reasons
    const rankings = enrichedParticipants.map((p, idx) => {
      const rank = idx + 1;
      const firstDiscoveryTime = p.firstDiscoveryTime ? new Date(p.firstDiscoveryTime) : null;
      const registeredAt = p.registeredAt ? new Date(p.registeredAt) : null;
      
      let reason = `${p.sitesDiscovered} site${p.sitesDiscovered !== 1 ? 's' : ''} discovered`;
      if (firstDiscoveryTime) {
        reason += ` (first at ${firstDiscoveryTime.toLocaleString()})`;
      }
      if (registeredAt) {
        reason += ` - Registered: ${registeredAt.toLocaleString()}`;
      }
      
      return {
        name: p.name,
        type: p.type,
        rank,
        sitesDiscovered: p.sitesDiscovered,
        totalTime: p.totalTimeDisplay,
        totalTimeMs: p.totalTimeMs,
        reason
      };
    });

    console.log("[Ranking API] Successfully generated rankings:", rankings.length);
    return Response.json({ rankings }, { status: 200 });
  } catch (error) {
    console.error("[Ranking API] Error:", error.message);
    console.error("[Ranking API] Error stack:", error.stack);
    return Response.json(
      { error: error.message || "Failed to generate rankings", details: error.toString() },
      { status: 500 }
    );
  }
}
