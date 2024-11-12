import { Grid, GridItem } from "@chakra-ui/react";
import TaskTable from "./Task/TaskTable";
import Navbar from "./Task/Components/Navbar";

function App() {
  return (
    <>
    <Grid templateAreas={`"nav nav" "main main"`} templateColumns={'1fr 1fr'}>
      <GridItem area={"nav"}><Navbar/></GridItem>
      <GridItem area={"main"}>
      <TaskTable />
      </GridItem>
      </Grid>
    </>
  );
}

export default App;
