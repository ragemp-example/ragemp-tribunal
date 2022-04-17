let blipBoats;
let blipMaterials;
let blipTrucks;
let blipFaction;

mp.events.add({
   'materialWar.timer.show': (state, time) => {
         if (state) {
            const mins = Math.floor(time / 60000);
            const seconds = (time - mins*60000) / 1000
            mp.callCEFVN({ "materialsTimer.show": true });
            mp.callCEFVN({ "materialsTimer.minutes": mins });
            mp.callCEFVN({ "materialsTimer.seconds": seconds });
            mp.callCEFV(`materialsTimer.start()`);
         } else {
            mp.callCEFV(`materialsTimer.end()`);
            mp.callCEFVN({ "materialsTimer.show": false });
         }
   },
   'materialWar.blip.boats.add': (position) => {
         if (blipBoats) return;

         const { x, y, z } = position;

         blipBoats = mp.blips.new(404, new mp.Vector3(x, y, z), {
            color: 7,
            shortRange: false,
            dimension: mp.players.local.dimension,
            name: 'Лодки'
         });
         blipBoats.setRoute(true);
   },
   'materialWar.blip.boats.destroy': () => {
      if (!blipBoats) return;
      blipBoats.destroy();
      blipBoats = null;
   },
   'materialWar.blip.materials.add': (position) => {
      if (blipMaterials) return;

      const { x, y, z } = position;

      blipMaterials = mp.blips.new(478, new mp.Vector3(x, y, z), {
         color: 7,
         shortRange: false,
         dimension: mp.players.local.dimension,
         name: 'Материалы'
      });
      blipMaterials.setRoute(true);
   },
   'materialWar.blip.materials.destroy': () => {
      if (!blipMaterials) return;
      blipMaterials.destroy();
      blipMaterials = null;
   },
   'materialWar.blip.trucks.add': (position) => {
      if (blipTrucks) return;

      const { x, y, z } = position;

      blipTrucks = mp.blips.new(318, new mp.Vector3(x, y, z), {
         color: 7,
         shortRange: false,
         dimension: mp.players.local.dimension,
         name: 'Грузовики'
      });
      blipTrucks.setRoute(true);
   },
   'materialWar.blip.trucks.destroy': () => {
      if (!blipTrucks) return;
      blipTrucks.destroy();
      blipTrucks = null;
   },
   'materialWar.blip.faction.add': (position) => {
      if (blipFaction) return;

      const { x, y, z } = position;

      blipFaction = mp.blips.new(1, new mp.Vector3(x, y, z), {
         color: 7,
         shortRange: false,
         dimension: mp.players.local.dimension,
         name: 'Фракция'
      });
      blipFaction.setRoute(true);
   },
   'materialWar.blip.faction.destroy': () => {
      if (!blipFaction) return;
      blipFaction.destroy();
      blipFaction = null;
   },
});

mp.keys.bind(0x42, true, () => {
   if (mp.players.local.vehicle) return;
   let vehicle = mp.utils.getNearVehicle(mp.players.local.position, 5);
   if (!vehicle) return;
   if (!vehicle.getVariable('mwVehicle')) return;

   if (mp.players.local.hasAttachment('materialsBox')) {
      mp.events.callRemote('materialWar.box.put', vehicle.remoteId);
   } else {
      mp.events.callRemote('materialWar.box.takeFromVeh', vehicle.remoteId);
   }
});