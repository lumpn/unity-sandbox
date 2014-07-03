using UnityEngine;
using System;
using System.Threading;

public class CSParallelTest : MonoBehaviour
{
		private const int numEntities = 1000;
		private const int numRanges = 500;
		private int[] positions;
		private int[] rangeCounters;
		private Semaphore semaphore;
	
		// Use this for initialization
		public void Start ()
		{
				Run ();
		}
	
		public void Run ()
		{
				Debug.Log ("CS running " + numRanges + " ranges on " + numEntities + " entity positions...");

				// create positions
				var random = new System.Random (1);
				positions = new int[numEntities];
				for (int i = 0; i < numEntities; i++) {
						positions [i] = random.Next (numEntities);
				}

				// create tasks
				var tasks = new RangeTask[numRanges];
				for (int i=0; i<numRanges; i++) {
						tasks [i] = new RangeTask (i, this);
				}

				// initialize
				rangeCounters = new int[numRanges];
				semaphore = new Semaphore (0, numRanges);

				// run sync
				var t1 = DateTime.Now;
				for (int i=0; i < numRanges; i++) {
						tasks [i].CalcCount ();
				}

				// run async
				var t2 = DateTime.Now;
				for (int i=0; i < numRanges; i++) {
						ThreadPool.QueueUserWorkItem (tasks [i].CalcCountAsync);
				}

				// barrier
				for (int i=0; i < numRanges; i++) {
						while (!semaphore.WaitOne()) {
								// retry
						}
				}

				// compute speedup
				var t3 = DateTime.Now;
				var time1 = t2 - t1;
				var time2 = t3 - t2;
				var speedup = time1.TotalMilliseconds / time2.TotalMilliseconds;
				Debug.Log ("C# Total time1 " + time1.TotalMilliseconds + " ms, time2 " + time2.TotalMilliseconds + " ms, speedup " + speedup);

				// debug computation
				var pos = positions [0] + ", " + positions [1] + ", " + positions [2] + ", " + positions [3] + ", " + positions [4] + ", "
						+ positions [5] + ", " + positions [6] + ", " + positions [7] + ", " + positions [8] + ", " + positions [9];
				var rng = rangeCounters [0] + ", " + rangeCounters [1] + ", " + rangeCounters [2] + ", " + rangeCounters [3] + ", " + rangeCounters [4] + ", "
						+ rangeCounters [5] + ", " + rangeCounters [6] + ", " + rangeCounters [7] + ", " + rangeCounters [8] + ", " + rangeCounters [9];
				Debug.Log (pos + "\n" + rng);
		}

		public class RangeTask
		{
				private int range;
				private CSParallelTest test;

				public RangeTask (int range, CSParallelTest test)
				{
						this.range = range;
						this.test = test;
				}

				public void CalcCountAsync (object state)
				{
						CalcCount ();
						test.semaphore.Release ();
				}

				public void CalcCount ()
				{
						int count = CountRange ();
						test.rangeCounters [range] = count;
				}

				public int CountRange ()
				{
						int count = 0;
						for (int i = 0; i < numEntities; i++) {
								for (int j = 0; j < numEntities; j++) {
										if (Mathf.Abs (test.positions [i] - test.positions [j]) < range) {
												count++;
										} 
								}
						}
						return count;
				}
		}
}
