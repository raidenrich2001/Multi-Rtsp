import { Route,Routes } from "react-router-dom";
import MultiRtsp from "./components/MultiRtsp";

function App() {

  return (
      <Routes>
          <Route path='/' element={<MultiRtsp></MultiRtsp>}></Route>
      </Routes>
  );
}

export default App;
