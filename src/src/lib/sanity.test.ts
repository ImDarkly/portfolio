import { strict as assert } from "node:assert"
import test from "node:test"

import { sanityClient } from "./sanity"

test("sanity client is configured from Vite env", () => {
  assert.equal(typeof sanityClient.config().projectId, "string")
  assert.equal(typeof sanityClient.config().dataset, "string")
})
