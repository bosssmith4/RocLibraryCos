import MapViewer from "@/components/MapViewer/MapViewer";
import { jittlebugGuide } from "@/services/mapData/jittlebugData";
import DungeonGuide from "./components/DungeonGuide";

export default function JittlebugPage() {
  return (
    <>
      <MapViewer name="1@jtb" title="Jittlebug" />
      <DungeonGuide guide={jittlebugGuide} />
    </>
  );
}
