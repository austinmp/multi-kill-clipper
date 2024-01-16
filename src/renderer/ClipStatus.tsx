import LoadingStatus from './common/LoadingStatus';
import styles from './multi-kill-clipper.module.css';
import Section from './common/Section';

type ClipStatusProps = {
  isLoading: boolean;
  message: string;
};

export default function ClipStatus({ isLoading, message }: ClipStatusProps) {
  return (
    isLoading && (
      <Section>
        <div className={styles.clipStatusCtn}>
          <LoadingStatus isLoading={isLoading} message={message} />
        </div>
      </Section>
    )
  );
}
