from services.config.workout_config import PROMPT


class LLMCoach:
    def __init__(self, groq_client):
        self.client = groq_client
        self.history = []
        self.system_prompt = PROMPT

    def _get_fallback_text(self, event, issue):
        if issue:
            return f"Form alert: {issue}"
        if event == "workout_started":
            return "Workout started! Stay focused, maintain control, and let's make every rep count!"
        elif event == "workout_completed":
            return "Fantastic work! Session completed. Take time to stretch and stay hydrated!"
        elif event == "set_completed":
            return "Set completed! Great effort. Take a quick rest before your next set."
        elif event == "no_pose_detected":
            return "Step into the camera frame so I can guide your form."
        return "Keep going! Maintain solid control and steady breathing."

    def give_feedback(self, event, issue):
        if not self.client or not getattr(self.client, "api_key", None):
            return self._get_fallback_text(event, issue)

        prompt = f"Event: {event}"
        if issue:
            prompt += f" Form Issue: {issue}"

        messages = [
            {"role": "system", "content": self.system_prompt},
            *self.history[-10:],
            {"role": "user", "content": prompt}
        ]

        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                temperature=0.4,
            )

            text = response.choices[0].message.content.strip()
            self.history.append({"role": "assistant", "content": text})
            return text
        except Exception as e:
            print(f"Warning: Groq API call failed ({e}). Using fallback cue.")
            return self._get_fallback_text(event, issue)

    