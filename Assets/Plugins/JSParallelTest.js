#pragma strict


public class JSParallelTest extends MonoBehaviour
{
		private static var numEntities : int = 1000;
		private static var numRanges : int = 500;
		
		private var positions : int[];
		private var rangeCounters : int[];
		
		private var semaphore : System.Threading.Semaphore;

		// Use this for initialization
		function Start() : void
		{
			Run();
		}
		
		function Run () : void
		{
				Debug.Log ("JS running " + numRanges + " ranges on " + numEntities + " entity positions...");
				
				// create positions
				var random = new System.Random (1);
				positions = new int[numEntities];
				for (var i:int = 0; i < numEntities; i++) {
						positions[i] = random.Next (numEntities);
				}

				// create tasks
				var tasks = new RangeTask[numRanges];
				for (i = 0; i < numRanges; i++) {
						tasks[i] = new RangeTask (i, this);
				}

				// initialize
				rangeCounters = new int[numRanges];
				semaphore = new System.Threading.Semaphore (0, numRanges);

				// run sync
				var t1 = System.DateTime.Now;
				for (i = 0; i < numRanges; i++) {
						tasks[i].CalcCount ();
				}

				// run async
				var t2 = System.DateTime.Now;
				for (i = 0; i < numRanges; i++) {
						System.Threading.ThreadPool.QueueUserWorkItem (tasks[i].CalcCountAsync);
				}

				// barrier
				for (i=0; i < numRanges; i++) {
						while (!semaphore.WaitOne()) {
								// retry
						}
				}

				// compute speedup
				var t3 = System.DateTime.Now;
				var time1 = t2 - t1;
				var time2 = t3 - t2;
				var speedup = time1.TotalMilliseconds / time2.TotalMilliseconds;
				Debug.Log ("JS Total time1 " + time1.TotalMilliseconds + " ms, time2 " + time2.TotalMilliseconds + " ms, speedup "+ speedup);
				
				// debug computation
				var pos = positions[0] +", "+positions[1] +", "+positions[2] +", "+positions[3] +", "+positions[4] +", "
						+positions[5] +", "+positions[6] +", "+positions[7] +", "+positions[8] +", "+positions[9];
				var rng = rangeCounters[0] +", "+rangeCounters[1] +", "+rangeCounters[2] +", "+rangeCounters[3] +", "+rangeCounters[4] +", "
						+rangeCounters[5] +", "+rangeCounters[6] +", "+rangeCounters[7] +", "+rangeCounters[8] +", "+rangeCounters[9];
				Debug.Log (pos + "\n" + rng);
		}

		public class RangeTask
		{
				private var range : int;
				private var test : JSParallelTest;

				public function RangeTask ( range : int, test : JSParallelTest)
				{
						this.range = range;
						this.test = test;
				}

				public function CalcCountAsync ( state : Object ) : void
				{
						CalcCount ();
						test.semaphore.Release ();
				}

				public function CalcCount () : void
				{
						var count : int  = CountRange ();
						test.rangeCounters [range] = count;
				}

				public function CountRange () : int
				{
						var count : int = 0;
						for (var i :int = 0; i < numEntities; i++) {
								for (var j : int = 0; j < numEntities; j++) {
										if (Mathf.Abs (test.positions [i] - test.positions [j]) <= range) {
												count++;
										} 
								}
						}
						return count;
				}
		}
}