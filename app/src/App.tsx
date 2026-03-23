import { BrowserRouter, Routes, Route } from "react-router";
import { AppLayout } from "./components/templates/AppLayout";
import { GraphPage } from "./components/pages/GraphPage";
import { PersonPage } from "./components/pages/PersonPage";
import { FeedPage } from "./components/pages/FeedPage";
import { IframeReaderPage } from "./components/pages/IframeReaderPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<GraphPage />} />
          <Route path="person/:id" element={<PersonPage />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="read/:articleId" element={<IframeReaderPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
