import { initEdgeStore } from "@edgestore/server";
import {
  CreateContextOptions,
  createEdgeStoreNextHandler,
} from "@edgestore/server/adapters/next/app";
import { z } from "zod";

const es = initEdgeStore.create();

const edgeStoreRouter = es.router( {myPublicImages: es.imageBucket()})

const handler = createEdgeStoreNextHandler({
    router: edgeStoreRouter,
});

  


export { handler as GET, handler as POST };

export type EdgeStoreRouter = typeof edgeStoreRouter;