using UnityEngine;
using UnityEditor;

[CustomEditor(typeof(CSParallelTest))]
public class SharpParallelTestEditor : Editor
{
		// Show the custom GUI controls
		public override void OnInspectorGUI ()
		{
				if (GUILayout.Button ("Run Test")) {
						(target as CSParallelTest).Run ();
				}
		}
}
