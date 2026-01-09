import ProjectDetailPage from "@/components/projects/ProjectDetailPage";

interface PageProps {
    params: {
        id: string;
    };
}

export default function ProjectPage({ params }: PageProps) {
    return <ProjectDetailPage projectId={params.id} />;
}