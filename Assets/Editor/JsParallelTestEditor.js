#pragma strict

@CustomEditor(JSParallelTest)
public class JSParallelTestEditor extends Editor
{
		// Show the custom GUI controls
		public override function OnInspectorGUI () : void
		{
				if (GUILayout.Button ("Run Test")) {
						(target as JSParallelTest).Run ();
				}
		}
}
