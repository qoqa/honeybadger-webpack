function * generator (
  promiseFactories
) {
  for (let i = 0; i < promiseFactories.length; ++i) {
    yield [promiseFactories[i](), i]
  }
}

async function worker (generator, result) {
  for (const [promise, index] of generator) {
    result[index] = await promise
  }
}

export default async function resolveAllPromise (
  promiseFactories,
  workerCount
) {
  // The generator is shared between workers, ensuring each promise is only resolved once
  const sharedGenerator = generator(promiseFactories)

  // Shared result for all promises
  const result = []

  // There's no need to create more workers than promises to resolve
  const actualWorkerCount = Math.min(
    Number(workerCount),
    promiseFactories.length
  )

  const workers = Array.from(new Array(actualWorkerCount)).map(() =>
    worker(sharedGenerator, result)
  )

  // Wait for all the workers to do their job
  await Promise.all(workers)

  return result
}
