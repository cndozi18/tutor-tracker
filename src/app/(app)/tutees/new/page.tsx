import { TuteeForm } from '@/components/tutees/TuteeForm';

export default function NewTuteePage() {
  return (
    <div className="px-5 pt-8 pb-6 max-w-lg mx-auto">
      <h1 className="font-serif text-3xl text-text mb-6">New tutee</h1>
      <TuteeForm mode="create" />
    </div>
  );
}
